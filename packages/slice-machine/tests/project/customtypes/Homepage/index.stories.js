import * as Slices from '../slices'
import SliceZone from 'vue-slicezone'

import CallToActionMock from '../slices/CallToAction/mocks.json'
import CallToAction2Mock from '../slices/CallToAction2/mocks.json'

export default {
  title: 'HomePage'
}

export const DefaultView = () => ({
  components: {
    ...Slices,
    SliceZone,
  },
  data() {
    return {
      mock: [CallToActionMock[0], CallToAction2Mock[0]],
      resolver({ sliceName }) {
        return Slices[sliceName]
      }
    };
  },
  template: '<slice-zone :slices="mock" :resolver="resolver" />',
})

DefaultView.storyName = 'mySliceZone'
