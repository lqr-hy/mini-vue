import { isFunction, isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

// set 考虑对象循环引用
function traversal (value, set = new Set()) {
  // 终结条件 不是对象就不递归
  if (!isObject(value)) return value

  // 防止循环引用
  if (set.has(value)) {
    return value
  }

  set.add(value)
  for (const key in value) {
    traversal(value[key], set)
  }

  return value
}

export const watch = (source, callBack) => {
  let getter
  if (isReactive(source)) {
    console.log('--', source)
    // 如果传入的是对象，需要进行循环 递归进行收集依赖
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }

  let cleanFn // 保存用户的函数
  const onCleanup = (fn) => {
    cleanFn = fn
  }

  let oldValue
  const job = () => {
    if (cleanFn) { // 下次watch 开始出发上一次watch的清除回掉
      cleanFn()
    }
    const newValue = effect.run()
    callBack(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter, job)
  oldValue = effect.run()
}
