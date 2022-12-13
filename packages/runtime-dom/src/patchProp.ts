import { patchAttr } from './modules/attrs'
import { patchClass } from './modules/class'
import { patchEvents } from './modules/events'
import { patchStyle } from './modules/style'

export function patchProp(el, key, preValue, nextValue = {}) {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, preValue, nextValue)
  } else if (/^on[^a-zA-Z]/.test(key)) {
    patchEvents(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}
