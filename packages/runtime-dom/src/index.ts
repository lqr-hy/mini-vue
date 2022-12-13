import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = Object.assign(nodeOps, { patchProp })

export function render (vNode, container) {
  // 创建渲染器的时候传入选项
  createRenderer(rendererOptions).render(vNode, container)
}

export * from '@vue/runtime-core'