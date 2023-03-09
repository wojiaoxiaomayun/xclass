import Vue from "vue";
import App from './App.vue'
import xclass from 'xclass-vue'
Vue.use(xclass,{
  debug:true,
  pseudoClassDefine:{
      'hov:':':hover'
  },
  initialRenderNum:-1
})
new Vue({
  render:h => h(App)
}).$mount('#app')