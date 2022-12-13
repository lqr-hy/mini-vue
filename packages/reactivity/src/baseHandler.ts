import { isObject } from '@vue/shared'
import { reactive } from './reactive'
import { track, trigger } from './effect'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const baseHandler = {
  get(target, key, receiver) {
    // 创建标识 防止传入已代理过的对象
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // 依赖
    track(target, 'get', key)
    // 为啥不用return 如果 对象嵌套 对未使用的key没办法做到两次拦截
    // receiver 改变了调用取值的this 使this指向代理对象
    let res = Reflect.get(target, key, receiver)

    if (isObject(res)) { 
      return reactive(res) // 深度代理 取值就可以进行代理 相比vue需要递归代理性能更好
    }

    return res
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}
