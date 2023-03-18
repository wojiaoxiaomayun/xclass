<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <!-- <div v-for="i in 10000" style="width:100px;padding:12px;background:red;display:flex;align-items:center;justify-content:center;">example{{i}}</div> -->
  <!-- <div xclass v-for="i in 10000" class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example{{i}}</div> -->
  <div  xclass:test.real="['w-100','hover:f-color-white']"  
  class="w-100 over-hidden padding-12 hover:bg-primary md:hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
  <div xclass:test.real="['w-100','hover:f-color-white']"  class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
  <!-- <div 
  xclass:test.real="['hover:bg-red','hov:f-color-white']" class="w-100 h-50 bg-primary hover:bg-red">aa</div> -->
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  /* transition: filter 300ms; */
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
