import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define:{
    'process.env':{}
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MyLib',
      // the proper extensions will be added
      fileName: 'my-lib',
    }
  }
})
