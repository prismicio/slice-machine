const fs = require('fs')
const path = require('path')
const Mustache = require('mustache')

Mustache.tags = ['[[', ']]']

module.exports = () => {
  const files = [
    {
      name: "prismic.config.js",
      f: Mustache.render(
        fs.readFileSync(
          path.join(__dirname, "templates/prismic.config.mustache"),
          "utf8"
        ),
        {}
      )
    },
    {
      name: "pages/index.vue",
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
          sliceMachinePath: "@/sliceMachine"
        }
      )
    }
  ];
	return {
    createFiles: (handle) => files.forEach(handle),
    info: {
      frameworkName: "Nuxt",
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
      recap: Mustache.render(
        fs.readFileSync(path.join(__dirname, "info.mustache"), "utf8"),
        {}
      ),
      bootstraper: ["npx", ["create-nuxt-app"]],
      dependencies: ["prismic-javascript", "prismic-vue", "@nuxtjs/prismic"],
      devDependencies: ["node-sass", "sass-loader"],
    }
  };
}
