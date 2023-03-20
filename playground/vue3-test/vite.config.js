import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import XclassPlugin from 'unplugin-xclass'
// import config from './src/xclass.config'
import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    hmr:true
  },
  plugins: [vue(),Inspect()],
})
