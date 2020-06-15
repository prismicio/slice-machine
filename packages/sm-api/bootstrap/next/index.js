const merge = require("../../common/manifest").merge

const defaultLibrary = 'react-essential-slices';

module.exports = {
  defaultLibrary,
  build: (library = defaultLibrary, routes = null) => (merge({
    framework: 'next',
    frameworkName: "Next",
    configPath: "next.config.js",
    firstCommand: "npm run dev",
    projectTests: [{
        arg: "-f",
        path: "next.config.js",
        reason: "No `next.config.js` file found"
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
    bootstraper: ["npx", ["create-react-app"]],
    transpile: ["next-slicezone"],
    dependencies: ["prismic-javascript", "prismic-reactjs", "next-slicezone"]
  }, library))
}
