import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import XClassAll from 'xclass-all'
XClassAll({
    debug:false
})
let app = createApp(App)
app.mount('#app')