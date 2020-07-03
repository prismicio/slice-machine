const merge = require("../../common/manifest").merge

const defaultLibrary = { packageName: 'vue-essential-slices' };

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
    libraries: [],
    bootstraper: ["npx", ["create-nuxt-app"]],
    transpile: ["vue-slicezone", "nuxt-sm"],
    dependencies: ["prismic-javascript", "@prismicio/vue", "@nuxtjs/prismic", "vue-slicezone", "nuxt-sm"],
    modules: [[
      '@nuxtjs/prismic',
      {
        endpoint: '{{{ apiEndpoint }}}',
        apiOptions: {
          routes
        }
      }
    ], ['nuxt-sm']]
  }, library))
}
