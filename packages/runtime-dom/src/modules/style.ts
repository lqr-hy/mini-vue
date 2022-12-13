export function patchStyle(el, preValue, nextValue) {
  for (const key in nextValue) {
    el.style[key] = nextValue[key]
  }

  // 删除上一次不存在的
  if (preValue) {
    for (const key in preValue) {
      if (nextValue[key] === null) {
        el.style[key] = null
      }
    }
  }
}
