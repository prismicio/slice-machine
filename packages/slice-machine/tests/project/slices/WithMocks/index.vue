<template>
  <section class="section">
    <prismic-image :field="slice.primary.image" />
    <prismic-rich-text :field="slice.primary.title" class="title" />
    <prismic-rich-text :field="slice.primary.description" />
    <button class="button" :style="`background: ${slice.primary.color || '#FFF'}`">
      {{ slice.primary.keyText }}
    </button>
  </section>
</template>
<script>
export default {
  props: {
    slice: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },
}
</script>
<style scoped>
.section {
  position: relative;
  background: #F7F7F7;
  color: #111;
  padding: 4em;
  text-align: center;
}
a {
  color: #111;
}
.button {
  border: 1px solid #111;
  border-radius: 4px;
  padding: 8px;
}
.title {
  margin-bottom: 2em;
}
</style>

