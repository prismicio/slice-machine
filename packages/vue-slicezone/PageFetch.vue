<template>
  <div>
    <div v-if="$fetchState && ($fetchState.pending || $fetchState.error)">
      <div v-if="$fetchState.error">
        <p>An error occured while fetching content: <span style="color:tomato">{{$fetchState.error}}</span></p>
      </div>
      <div v-else></div>
    </div>
    <div v-else>
      <slice-zone v-bind="$props" :slices="slices" />
    </div>
  </div>
</template>

<script>
import SliceZone from './SliceZone'

const multiQueryTypes = ['repeat', 'repeatable', 'multi']

export default {
  name: 'PageFetch',
  components: {
    SliceZone
  },
  props: {
    type: {
      type: String,
      required: true
    },
    uid: {
      type: String,
      required: false
    },
    queryType: {
      type: String,
      default: 'multi',
      validator(value) {
        return [...multiQueryTypes, 'single'].indexOf(value) !== -1
      }
    },
    body: {
      type: String,
      required: false,
      default: 'body'
    },
    ...(Object.entries(SliceZone.props)).reduce((acc, [key, value]) => {
      if (['slices'].indexOf(key) === -1) {
        return {
          ...acc,
          [key]: value
        }
      }
      return acc
    }, {})
  },
  data() {
    return {
      slices: [],
    }
  },
  async fetch() {
    try {
      const caller = multiQueryTypes.indexOf(this.queryType) !== -1
        ? ['getByUID', [this.type, this.uid]]
        : ['getSingle', [this.type]]
      const res = await this.$prismic.api[caller[0]](...caller[1])
      this.slices = res ? res.data[this.body] : []
    } catch(e) {
      console.error('[SliceZone/fetch]', e)
      this.slices = []
    }
  }
}
</script>