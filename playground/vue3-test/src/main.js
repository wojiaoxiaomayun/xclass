import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import createXclass from '@xnocss/all'
import config from './xclass.config'
createXclass(config)
let app = createApp(App)
app.mount('#app')