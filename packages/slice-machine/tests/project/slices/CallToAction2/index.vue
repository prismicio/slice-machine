<template>
  <section class="section">
    <prismic-rich-text :field="slice.primary.title" />
    <prismic-rich-text :field="slice.primary.desc" />
  </section>
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

