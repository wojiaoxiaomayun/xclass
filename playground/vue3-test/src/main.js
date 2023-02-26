import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import xclass from '@xclass/vue'

createApp(App).use(xclass,{
    debug:true,
    pseudoClassDefine:{
        'hov:':':hover'
    }
}).mount('#app')
