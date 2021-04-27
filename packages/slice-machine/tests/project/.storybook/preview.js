import Vue from 'vue';
import PrismicVue from '@prismicio/vue'

Vue.use(PrismicVue, {});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}