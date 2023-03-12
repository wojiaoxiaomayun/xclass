import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import XclassPlugin from 'unplugin-xclass'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [XclassPlugin.vite({}),vue()],
})
