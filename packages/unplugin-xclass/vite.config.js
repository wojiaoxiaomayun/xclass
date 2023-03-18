import { defineConfig } from 'vite'
import { resolve } from 'path'
import {nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  define:{
    'process.env':{}
  },
  build: {
    target:'ES2015',
    lib: {
      entry: resolve(__dirname, 'index.js'),
      name: 'unplugin-xclass',
      // the proper extensions will be added
      fileName: 'unplugin-xclass',
      formats:['umd']
    }
  },
  plugins:[nodeResolve(),commonjs()]
})
