import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import xclass from '@xclass/vue'
import XClassAll from 'xclass-all'

XClassAll({
    debug:false
})
let app = createApp(App)
// app.use(xclass,{
//     debug:true,
//     pseudoClassDefine:{
//         'hov:':':hover'
//     }
// })
app.mount('#app')