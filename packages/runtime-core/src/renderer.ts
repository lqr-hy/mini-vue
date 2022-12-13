import { isString, ShapeFlags } from '@vue/shared'
import { createVNode, isSameVNode } from './vnode'

export function createRenderer(rendererOptions) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    querySelect: hostQuerySelect,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = rendererOptions

  // 处理文本情况
  const normalize = (child, i) => {
    if (isString(child[i])) {
      const vNode = createVNode(Text, null, child[i])
      child[i] = vNode
    }
    return child[i]
  }

  // 递归挂在子元素
  const mountChildren = (el, children) => {
    for (let index = 0; index < children.length; index++) {
      const child = normalize(children, index)
      patch(null, child, el, null)
    }
  }

  // 挂在元素
  const mountElement = (vNode, container, anchor) => {
    let { type, props, children, shapeFlag } = vNode
    // 创建将虚拟节点挂在到这个正式节点上
    let el = (vNode.el = hostCreateElement(type))
    // 初始化props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 渲染子元素
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(el, children)
    }

    // 插入页面
    hostInsert(el, container, anchor)
  }

  // 处理文本
  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      const el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    for (const key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      debugger
      unmount(children[i])
    }
  }

  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // 从前 开始比较
    while (i <= e1 && i <= e2) {
      // 从头开始比
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNode(n1, n2)) {
        // 比较前两个是否相同 不相同就退出
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }

    // 从后往前比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNode(n1, n2)) {
        // 比较后两个是否相同 不相同就退出
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }

    // console.log(e1, e2, i)
    // i 比 e1大 新增
    // i 到  e2 部分为新增
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          // 已e2为参照物判断是增加 还是插入
          const nextPos = e2 + 1
          // 参照物 如果当前参照物小于c2的长度 说明是插入
          const anchor = nextPos < c2.length ? c2[nextPos].el : null
          patch(null, c2[i], el, anchor) // 创建新的节点
          i++
        }
      }
    } else if (i > e2) {
      // i比e2大
      // 删除i到e1之间的
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i])
          i++
        }
      }
    }

    // 乱序对比
    let s1 = i
    let s2 = i
    const keyToNexIndexMap = new Map()
    for (let i = s2; i <= e2; i++) {
      keyToNexIndexMap.set(c2[i].key, i)
    }
    console.log(i, e1, e2)

    // 循环老的元素 看新的里面有没有 有就比较诧异 没有就添加 老的有新的没有就删除
    const toBePatched = e2 - s2 + 1
    // 标记新的所有对应老的位置 记录是否被比对过
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
    for (let i = s1; i <= e1; i++) {
      const oldChild = c1[i]
      let newIndex = keyToNexIndexMap.get(oldChild.key) // 老的去新的里面找
      console.log(newIndex)
      if (newIndex === undefined) {
        unmount(oldChild)
      } else {
        // 新的位置 对应老的位置
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        patch(oldChild, c2[newIndex], el)
      }
    }

    // 移动位置
    for (let i = toBePatched - 1; i >= 0; i--) {
      let index = i + s2
      let current = c2[index]
      // 找到参照物
      let anchor = index + 1 < c2.length ? c2[index + 1].el : null
      if (newIndexToOldIndexMap[i] === 0) { // 表示是新增节点
        patch(null, current, el, anchor)
      } else { // 老节点存在 移动位置
        hostInsert(current.el, el, anchor)
      }
    }
  }

  // 处理子节点
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children
    const c2 = n2.children
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除所有节点
        unmountChildren(c1) // 文本 数组 设置新的文本
      }
      if (c1 !== c2) {
        // 文本 文本
        hostSetElementText(el, c2)
      }
    } else {
      // 现在为数组或者为空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 数组  数组
          patchKeyedChildren(c1, c2, el)
        } else {
          unmountChildren(c1) // 空 数组
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '') //数组 文本
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          debugger
          mountChildren(el, c2) // 数组 文本
        }
      }
    }
  }

  // 更新元素
  const patchElement = (n1, n2) => {
    const el = (n2.el = n1.el) // 先复用节点  在比较 属性
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, el)
  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2)
    }
  }

  // 更新
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 === n2) return

    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null
    }
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 初始化过程
          processElement(n1, n2, container, anchor)
        }
    }
  }

  // 卸载节点
  const unmount = (vNode) => {
    hostRemove(vNode.el)
  }

  // 虚拟dom
  const render = (vNode, container) => {
    // 渲染过程用你传入的renderOptions渲染
    if (vNode === null) {
      // 卸载逻辑
      if (container._vNode) {
        unmount(container._vNode)
      }
    } else {
      // 初始化逻辑，和更新
      patch(container._vNode || null, vNode, container)
    }
    // 保存上一次的vNode
    container._vNode = vNode
  }

  return {
    render
  }
}
