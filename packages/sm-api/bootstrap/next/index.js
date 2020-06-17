const Mustache = require('mustache');
const merge = require("../../common/manifest").merge

const defaultLibrary = 'react-essential-slices';

const _app = require('./files/_app.mustache'),
const _document = require('./files/_document.mustache'),
const nextConfig = require('./files/next.config.mustache'),
const prismic = require('./files/prismic.mustache'),
const smResolver = require('./files/sm=resolver.mustache')

module.exports = {
  defaultLibrary,
  build: (library = defaultLibrary, routes = null) => (merge({
    framework: 'next',
    frameworkName: "Next",
    configPath: "next.config.js",
    firstCommand: "npm run dev",
    projectTests: [
      {
        arg: "-d",
        path: "pages",
        reason: "No `pages` folder found"
      }
    ],
    bootstraper: ["npx", ["create-react-app"]],
    dependencies: ["prismic-javascript", "prismic-reactjs", "next-slicezone", "next-transpile-modules"],
    files: [{
      name: '_app.js',
      path: './pages',
      content: Mustache.render(_app)
    }, {
      name: '_document.js',
      path: './pages',
      content: Mustache.render(_document)
    }, {
      name: 'next.config.js',
      path: './',
      content: Mustache.render(nextConfig)
    }, {
      name: 'prismic.js',
      path: './',
      content: Mustache.render(prismic, routes)
    }, {
      name: 'sm-resolver.js',
      path: './',
      content: Mustache.render(smResolver)
    }],
  }, library))
}

JSON.stringify(routes)
[{
  type: 'page',
  path: '/:uid',
  href: '/[uid]'
}]