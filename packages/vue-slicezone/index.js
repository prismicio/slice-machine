import PageFetch from './PageFetch'
import SliceZone from './SliceZone'

export default {
  name: 'SliceZone',
  functional: true,
  render(h, context) {
    const {
      props: {
        slices,
        type,
        uid,
      }
    } = context

    if (!slices && type && uid) {
      return h(PageFetch, context)
    }
    return h(SliceZone, context)
  }
}