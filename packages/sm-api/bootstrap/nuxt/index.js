const merge = require("../../common/manifest").merge

const defaultLibrary = 'vue-essential-slices';

module.exports = {
  defaultLibrary,
  build: (library = defaultLibrary, routes = null) => (merge({
    framework: 'nuxt',
    frameworkName: "Nuxt",
    configPath: "nuxt.config.js",
    firstCommand: "npm run dev",
    projectTests: [{
        arg: "-f",
        path: "nuxt.config.js",
        reason: "No `nuxt.config.js` file found"
      },
      {
        arg: "-d",
        path: "pages",
        reason: "No `pages` folder found"
      }
    ],
    prompts: [{
      type: 'folder',
      path: 'custom_types',
      strategies: ['bootstrap', 'init']
    }, ],
    devDependencies: [],
    // what gets transpiled
    libraries: ["vue-slicezone"],
    bootstraper: ["npx", ["create-nuxt-app"]],
    dependencies: ["prismic-javascript", "prismic-vue", "@nuxtjs/prismic", "vue-slicezone"],
    module: [
      '@nuxtjs/prismic',
      {
        endpoint: '{{{ apiEndpoint }}}',
        apiOptions: {
          routes
        }
      }
    ]
  }, library))
}
