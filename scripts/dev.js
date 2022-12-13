const args = require('minimist')(process.argv.slice(2))
const { resolve } = require('path')
const { build } = require('esbuild')

// minimist 解析node 命令行参数

const target = args._[0] || 'reactivity'
const format = args.f || 'global'


// 开发环境只打包一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))
// iife 立即执行函数
// cjs node模块
// esm esModule模块
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true, // 把所有的包打到一起
  sourcemap: true,
  format: outputFormat, // 输出的格式
  globalName: pkg.buildOptions?.name, // 全局名称
  platform: format === 'cjs' ? 'node' : 'browser',
  watch: {
    onRebuild (err) {
      if (!err) console.log('rebuilt----')
    }
  }
}).then(() => {
  console.log('watching----')
})