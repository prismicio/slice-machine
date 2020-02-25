# SliceZone

A component that matches front-end components with Prismic slices.
Pretty much a work in progress, README coming soon.

### Configuration

Depending on where you use the SliceZone, you may have to configure your app to transpile it from es6.
Example with Nuxt config:

```javascript

// in nuxt.config.js

build: {
  transpile: ['vue-slicezone']
}

````

Usage:

```vue
<template>
  <slice-zone :resolver="resolver" :slices="page.data.body" />
</template>
<script>
import SliceZone from 'vue-slicezone'

export default {
  components: {
    SliceZone
  },
  async asyncData({ params, $prismic }) {
    return {
        page: await $prismic.api.getByUID('page', params.uid)
      }
  },
  methods: {
    resolver({ sliceName }) {
      return [
        import(`path/to/slices/${sliceName}/index.vue`),
        import(`node/mo/dule/${sliceName}.vue`)
      ]
    }
  }
}
</script>
````
