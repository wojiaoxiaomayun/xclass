<template>
<div>
    <div v-xclass v-for="i in 10000" :key="i" class="padding-16 radius-4 bg-primary">aa</div>
</div>
</template>
<script>
    export default{
        name:'App'
    }
</script>