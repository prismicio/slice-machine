<template>
  <div>
    <div :style="`max-width: 600px; margin: 0 auto;background: #FFF; color: ${slice.primary.color}`">
        {{ slice.primary.bool === true ? 'IS TRUE' : 'IS NOT TRUE' }}
        <prismic-rich-text :field="slice.primary.ownContent" />
        <prismic-rich-text :field="slice.primary.ownContent2" />
        <prismic-rich-text :field="slice.primary.ownContent3" />
      </div>
    <section class="section">
      <img :src="slice.primary.image.url" style="width: 120px"/>
      <prismic-image :field="slice.primary.image2.square" style="width: 60px" />
      <div style="max-width: 600px; margin: 0 auto">
        <prismic-rich-text :field="slice.primary.title" />
        <prismic-rich-text :field="slice.primary.text" />
      </div>
    </section>
    <div style="margin: 2em auto; max-width: 1000px;">
      <prismic-rich-text :field="slice.primary.multi" />
    </div>
    <prismic-image :field="slice.primary.image3" style="width: 240px" />
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

