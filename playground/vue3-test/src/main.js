import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import xclass from '@vue-xclass/core'

createApp(App).use(xclass,{
    debug:true,
    pseudoClassDefine:{
        'hov:':':hover'
    }
}).mount('#app')
