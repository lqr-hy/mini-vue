function createInvoker(callBack) {
  const invoker = (e) => invoker.value(e)
  invoker.value = callBack
  return invoker
}

export function patchEvents(el, eventName, nextValue) {
  // 先移除事件 重新绑定
  let invokers = el._vei || (el._vei = {})

  let exits = invokers[eventName] // 查看是否缓存过

  // 如果是空
  if (exits && nextValue) {
    exits
  } else {
    let event = eventName.slice(2).toLowerCase()

    if (nextValue) {
      const invoker = (invokers[eventName] = createInvoker(nextValue))
      el.addEventListener(event, invoker)
    } else if (exits) {
      // 如果有老值需要移除此事件
      el.removeEventListener(event, exits)
      invokers[eventName] = undefined
    }
  }
}
