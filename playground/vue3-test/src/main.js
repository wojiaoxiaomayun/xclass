import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import vueXclass from '@vue-xclass/core'

createApp(App).use(vueXclass,{
    debug:true,
    pseudoClassDefine:{
        'hov:':':hover'
    }
}).mount('#app')
