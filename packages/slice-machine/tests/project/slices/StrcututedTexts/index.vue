<template>
  <section class="section">
    <prismic-image :field="slice.primary.image" />
    <prismic-rich-text :field="slice.primary.title" />
    Link to test.com:
    <prismic-link :field="slice.primary.link">My Link</prismic-link>
    <br/>
    Rand link: <prismic-link :field="slice.primary.randLink">My Link</prismic-link>
    <br/>
    Select value "image_left": <span>{{ slice.primary.select }}</span><br/>
    Random Select value (A or B): <span>{{ slice.primary.randSelect }}</span><br/>
    True Bool: <span>{{ slice.primary.bool ? 'true' : 'false' }}</span><br/>
    Rand Bool: <span>{{ slice.primary.randBool ? 'true' : 'false' }}</span><br/>
    Today: <span>{{ slice.primary.today }}</span><br/>
    Random: <span>{{ slice.primary.randDate }}</span><br/>
    Rand Embed: <prismic-embed :field="slice.primary.randEmbed" /><br/>
    My Embed: <prismic-embed :field="slice.primary.embed" /><br/>
    Rand number: <span>{{ slice.primary.randNumber }}</span><br/>
    My number: <span>{{ slice.primary.number }}</span><br/>
    Moulin Rouge: <span>{{ slice.primary.moulin }}</span><br/>
    Rand Geo: <span>{{ slice.primary.randGeo }}</span><br/>
    <span :style="`color: ${slice.primary.randColor}`">Rand color</span><br/>
    <span :style="`color: ${slice.primary.tomato}`">TOMATO</span><br/>
    Rand Text: <span>{{ slice.primary.randText }}</span><br/>
    Welcome: <span>{{ slice.primary.text }}</span><br/>
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
.title {
  margin-bottom: 2em;
}
</style>

