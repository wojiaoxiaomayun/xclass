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
  <div x-class v-for="i in 1000" class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
  <!-- <div v-xclass:test.real="['hover:bg-red','hov:f-color-white']" class="w-100 h-50 bg-primary hover:bg-red hov:f-color-white">aa</div> -->
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
