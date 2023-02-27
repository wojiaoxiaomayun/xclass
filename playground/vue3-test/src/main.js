import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import xclass from '@xclass/vue'
import XClassAll from 'xclass-all'

let app = createApp(App).mount('#app')
XClassAll()
// .use(xclass,{
//     debug:true,
//     pseudoClassDefine:{
//         'hov:':':hover'
//     }
// })