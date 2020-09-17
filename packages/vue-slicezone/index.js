import PageFetch from './PageFetch'
import SliceZone from './SliceZone'

export default {
  name: 'SliceZone',
  props: (
    // Merge PageFetch and SliceZone props and make them not required at this stage
    Object
      .entries({ ...PageFetch.props, ...SliceZone.props })
      .reduce((acc, [key, value]) => {
        const newValue = { ...value }
        delete newValue.validator
        newValue.required = false

        return {
          ...acc,
          [key]: newValue
        }
      }, {})
  ),
  render(h) {
    const {
      type,
      uid,
      slices,
      queryType,
      resolver: maybeResolver
    } = this

    const component = (!slices && type && (uid || queryType === 'single')) ? PageFetch : SliceZone
    return h(component, {
      scopedSlots: this.$scopedSlots,
      props: {
        ...this.$props,
        resolver: maybeResolver || this.$sliceMachine.resolver
      }
    })
  }
}
