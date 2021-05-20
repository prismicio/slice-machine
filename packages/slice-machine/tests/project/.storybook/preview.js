import Vue from 'vue'
import '!style-loader!css-loader!sass-loader!vue-essential-slices/src/styles/styles.scss'
import PrismicVue from '@prismicio/vue'

Vue.use(PrismicVue, {});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}