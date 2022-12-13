import { isArray, isObject } from '@vue/shared'
import { createVNode, isVNode } from './vnode'

export function h(type, prop, children) {
  const l = arguments.length

  if (l === 2) {
    if (isObject(prop) && !isArray(prop)) {

      if (isVNode(prop)) {
        //  因为元素可以循环创建需要数组包装
        return createVNode(type, null, [children])
      } else {
        return createVNode(type, children)
      }
    } else {
      return createVNode(type, null, prop)
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, prop, children)
  }
}
