export let activeEffect = undefined

function cleanupEffect(effect) {
  // 取出实例收集的属性
  const { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    // 接触effect 重新依赖收集
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  //  实例新增active属性
  public active = true
  public deps = []
  // 解决依赖嵌套
  public parent = null
  constructor(public fn, public scheduler) {}

  run() {
    // 执行effect
    // 表示如果是非激活的情况，只需要执行函数，不需要手机依赖
    if (!this.active) {
      return this.fn()
    }
    // 收集依赖，核心就是当前effect 和 稍后的渲染属性关联在一起
    try {
      this.parent = activeEffect
      activeEffect = this
      // 清除之前的effect
      cleanupEffect(this)
      // 当稍后调用取之操作的时候就可以获取到这个全局activeEffect
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this) // 停止收集effect
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn 可以根据数据状态变化 重新执行，effect可以嵌套写
  const _effect = new ReactiveEffect(fn, options.scheduler) // 创建响应式effect
  _effect.run() // 默认先执行一次

  const runner = _effect.run.bind(_effect) // 绑定this
  runner.effect = _effect // 将effect挂在道runner函数上
  return runner
}

// weakMap (对象：map(属性： set(effect)))
// 一个effect 对应多个属性，一个属性对应多个effect 多对多
const targetMap = new WeakMap()
export function track(target, type, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target) // 第一次没有
  if (!depsMap) {
    // 添加
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  trackEffects(dep)
}

// 依赖收集
export function trackEffects(dep) {
  if (activeEffect) {
    let shouldTrack = !dep.has(activeEffect) // 去重
    if (shouldTrack) {
      dep.add(activeEffect)
      activeEffect.deps.push(dep) // 让effect记录对应dep 做一个双向记录 方便清理
    }
  }
}

// 触发更新
export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 触发的值不在模板使用

  let effects = depsMap.get(key) // 找到了对应的effect
  if (effects) {
    triggerEffects(effects)
  }
}

// 触发effect
export function triggerEffects(effects) {
  // 防止操作原effect 导致死循环 进行一次拷贝 执行之前拷贝一份 防止循环引用
  effects = new Set(effects)
  effects.forEach((effect) => {
    // 防止循环引用导致 栈溢出
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler() // 用户传了就执行用户的调度算法
      } else {
        effect.run() // 默认执行
      }
    }
  })
}
