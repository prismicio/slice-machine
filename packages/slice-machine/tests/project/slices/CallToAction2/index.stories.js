import Component from './';
import model from './model'
import mocks from './mocks.json'
import { storiesOf } from '@storybook/vue';

mocks.forEach((variation) => {
  storiesOf(model.name, Component).add(variation.name, () => ({
    components: {
      Component
    },
    data() {
      return {
        mock: variation
      }
    },
    template: '<Component :slice="mock" />'
  }))
})