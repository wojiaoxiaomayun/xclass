import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define:{
    'process.env':{}
  },
  build: {
    target:'ES2015',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'XClass',
      // the proper extensions will be added
      fileName: 'XClass',
    }
  }
})
