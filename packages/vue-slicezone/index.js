import PageFetch from './PageFetch'
import SliceZone from './SliceZone'

export default {
  name: 'SliceZone',
  render(h) {
    const {
      slices,
      type,
      uid,
      resolver: maybeResolver
    } = this.$attrs

    const resolver = maybeResolver || this.$sliceMachine.resolver
    if (!slices && type && uid) {
      return h(PageFetch, {
        props: {
          ...this.$attrs,
          resolver,
          scopedSlots: this.$scopedSlots,
        }
      })
    }
    return h(SliceZone, {
      scopedSlots: this.$scopedSlots,
      props: { ...this.$attrs, resolver }}
    )
  }
}