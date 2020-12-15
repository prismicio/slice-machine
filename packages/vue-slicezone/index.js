import PageFetch from './features/PageFetch'
import SliceZone from './features/SliceZone'

export default {
  name: 'SliceZone',
  render(h) {
    const {
      slices,
      type,
      uid,
      queryType,
      resolver: maybeResolver
    } = this.$attrs

    const resolver = maybeResolver || this.$sliceMachine.resolver
    if (!slices && type && (uid || queryType === 'single')) {
      return h(PageFetch, {
        props: {
          ...this.$attrs,
          resolver,
          scopedSlots: this.$scopedSlots
        }
      })
    }
    return h(SliceZone, {
      scopedSlots: this.$scopedSlots,
      props: { ...this.$attrs, resolver }
    })
  }
}
