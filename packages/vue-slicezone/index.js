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
      return h(PageFetch, { props: { ...this.$attrs, resolver }})
    }
    return h(SliceZone, { props: { ...this.$attrs, resolver }})
  }
}