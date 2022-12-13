import { isArray, isString, ShapeFlags } from '@vue/shared'

export const Text = Symbol('Text')

export const isVNode = (value) => {
  return !!(value && value.__v_isVNode)
}

export const isSameVNode = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key
}

export function createVNode(type, props, children = null) {
  // 组合方案 判断元素的子元素
  let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  const vNode = {
    type,
    props,
    children,
    key: props?.['key'],
    el: null,
    __v_isVNode: true,
    shapeFlag
  }

  if (children) {
    let type = 0
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vNode.shapeFlag |= type
  }
  return vNode
}
