import { isObject } from '@vue/shared'
import { baseHandler, ReactiveFlags } from './baseHandler'

// 不会造成内存泄露
const reactiveMap = new WeakMap()

// 判断是否是响应式对象
export const isReactive = (value) => {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

// 将数据转化成响应式 只能做对象的代理
export function reactive(target) {
  if (!isObject(target)) {
    return
  }

  // 判断是否被代理过 代理对象呗代理过直接返回 说明目标对象是一个代理对象，会走get
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // 判断当前对象是否已经存在代理了 做个缓存
  const exisitedProxy = reactiveMap.get(target)
  if (exisitedProxy) {
    return exisitedProxy
  }
  // 第一次普通对象代理，会执行new proxy
  // 下次 传proxy对象，需要查询是否被代理过， 如果访问过这个proxy 有get方法就说明访问过
  const proxy = new Proxy(target, baseHandler)

  reactiveMap.set(target, proxy)
  return proxy
}
