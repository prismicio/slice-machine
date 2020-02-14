<template>
  <slice-zone :slices="page.data.body" />
</template>
<script>
import { SliceZone } from '@/sliceMachine'

export default {
  components: {
    SliceZone
  },
  head () {
    return {
      title: this.page.data.meta_title,
      meta: [
        { hid: 'description', name: 'description', content: this.page.data.meta_description },
        ...this.page.data.social_cards.length ? ([
          { hid: 'og:title', name: 'og:title', content: this.page.data.social_cards[0].social_card_title },
          { hid: 'og:description', name: 'og:description', content: this.page.data.social_cards[0].social_card_description },
          { hid: 'og:image', name: 'og:image', content: this.page.data.social_cards[0].social_card_image.url },
        ]) : null
      ]
    }
  },
  async asyncData({ params, error, req, $prismic }) {
    const uid = params.uid || 'homepage'
    try {
      const result = await $prismic.api.getByUID('page', uid)
      return {
        page: result
      }
    } catch (e) {
      console.error(e);
      error({ statusCode: 404, message: `Document not found. Make sure you created a document of type 'page' with uid '${uid}' in your Prismic repository` })
    }
  }
}
</script>
