export default {
  buildModules: ["@nuxtjs/prismic"],

  prismic: {
    endpoint: "https://qwerty.cdn.prismic.io/api/v2",
    modern: true
  },

  build: {
    transpile: ["@prismicio/vue"]
  }
};