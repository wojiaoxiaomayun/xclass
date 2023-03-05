import Vue from "vue";
import App from './App.vue'
import xclass from 'xclass-vue'
Vue.use(xclass)
new Vue({
  render:h => h(App)
}).$mount('#app')