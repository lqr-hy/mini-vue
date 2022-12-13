import { isFunction } from '@vue/shared'
import { ReactiveEffect, trackEffects, triggerEffects } from './effect'

class ComputedRefImpl {
  public effect
  public _dirty = true // 默认取值的时候进行计算
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public dep = new Set()
  constructor(getter, public setter) {
    // 将用户的getter放入effect 中进行收集
    this.effect = new ReactiveEffect(getter, () => {
      // 依赖属性变化 会执行此调度函数
      if (!this._dirty) {
        this._dirty = true
        triggerEffects(this.dep)
        // 触发更新
      }
    })
    //
  }
  // 类中的属性防蚊器，底层就是Object.defineProperty
  get value() {
    debugger
    // 依赖收集
    trackEffects(this.dep)

    if (this._dirty) {
      this._dirty = false
      // 说明这个值是脏的
      this._value = this.effect.run()
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions) => {
  const onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {
      console.warn('no set')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}
