// Button.stories.js

import MyComponent from './';
import model from './model'
import mocks from './mocks.json'
import { storiesOf } from '@storybook/vue';
import SliceZone from 'vue-slicezone'


export default function (mock) {
  return {
    components: {
      MyComponent,
      SliceZone
    },
    methods: {
      resolve() {
        return MyComponent
      }
    },
    data() {
      return {
        mock: variation
      }
    },
    template: '<SliceZone :slices="[mock]" :resolver="resolve" />'
  }
}