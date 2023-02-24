import Vue from "vue";
import App from './App.vue'
import xclass from '@vue-xclass/core'
Vue.use(xclass)
new Vue({
  render:h => h(App)
}).$mount('#app')