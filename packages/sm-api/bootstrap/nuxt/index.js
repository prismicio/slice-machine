const fs = require('fs')
const path = require('path')
const Mustache = require('mustache')

const { defaultLibraries } = require('../../common/consts')

Mustache.tags = ['[[', ']]']

// Test this and move it elsewhere
function createArrayString(identifier, array) {
  return `${identifier}: [
    ${array.map((e) => {
      if (typeof e === "string") {
        return `'${e}'`
      }
      if (typeof e === "object") {
        return JSON.stringify(e)
      }
    })}
]`;
}

const nuxtDefaultPackage = defaultLibraries.nuxt
module.exports = (maybeProps) => {
  const files = [
    // {
    //   name: "prismic.config.js",
    //   f: Mustache.render(
    //     fs.readFileSync(
    //       path.join(__dirname, "templates/prismic.config.mustache"),
    //       "utf8"
    //     ),
    //     {}
    //   )
    // },
    {
      name: "pages/index.template.vue",
      template: true,
      f: Mustache.render(
        fs.readFileSync(
          path.join(__dirname, "templates/index.mustache"),
          "utf8"
        ),
        {}
      )
    },
    {
      name: "pages/_uid.vue",
      f: Mustache.render(
        fs.readFileSync(path.join(__dirname, "templates/uid.mustache"), "utf8"),
        {
          customType: "page",
          packageName: maybeProps ? maybeProps.packageName : null
        }
      )
    },
    // {
    //   name: "sliceMachine/sliceZone.vue",
    //   f: Mustache.render(
    //     fs.readFileSync(path.join(__dirname, "templates/slicezone.mustache"), "utf8"),
    //     {
    //       pathToSlices: './slices'
    //     }
    //   )
    // }
  ];

  console.log('hasHeadInfo', maybeProps && (maybeProps.css.length || maybeProps.script.length))
	return {
    files,
    manifest: {
      framework: 'nuxt',
      frameworkName: "Nuxt",
      configPath: "nuxt.config.js",
      defaultLibrary: nuxtDefaultPackage,
      firstCommand: "npm run dev",
      projectTests: [
        {
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
      prompts: [
        { type: 'folder', path: 'custom_types', strategies: ['bootstrap', 'init'] },
        // { type: 'folder', path: 'pages', strategies: ['bootstrap'] }
      ],
      recap: Mustache.render(
        fs.readFileSync(path.join(__dirname, "info.mustache"), "utf8"),
        {
          ...(maybeProps ? {
            css: createArrayString('css', maybeProps.css),
            script: createArrayString('script', maybeProps.script)
          } : null),
          isBootstrap: maybeProps && maybeProps.isBootstrap,
          hasHeadInfo: maybeProps && (maybeProps.css.length || maybeProps.script.length )
        }
      ),
      bootstraper: ["npx", ["create-nuxt-app"]],
      dependencies: ["@nuxtjs/prismic", "vue-slicezone", "prismic-javascript"],
      devDependencies: [],
      libraries: ["vue-slicezone"]
    }
  };
}
