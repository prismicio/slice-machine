<template>
  <div>
    <div :style="`max-width: 600px; margin: 0 auto;background: #FFF; color: #111`">
        <h1>{{ Math.random() }}</h1>
    </div>
  </div>
</template>
<script>
export default {
  props: ['slice'],
}
</script>
<style scoped>
.section {
  position: relative;
  background: #FFFF63;
  color: #111;
  padding: 4em;
  text-align: center;
}
a {
  color: #111;
}
</style>

