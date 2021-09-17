const fs = require("fs");
const path = require("path");
const Mustache = require("mustache");
const merge = require("../../common/manifest").merge;

const defaultLibrary = { packageName: "essential-slices" };

const _app = fs.readFileSync(
  path.join(__dirname, "./files/_app.mustache"),
  "utf-8"
);
const _document = fs.readFileSync(
  path.join(__dirname, "./files/_document.mustache"),
  "utf-8"
);
const nextConfig = fs.readFileSync(
  path.join(__dirname, "./files/next.config.mustache"),
  "utf-8"
);
const prismic = fs.readFileSync(
  path.join(__dirname, "./files/prismic.mustache"),
  "utf-8"
);
const smResolver = fs.readFileSync(
  path.join(__dirname, "./files/sm-resolver.mustache"),
  "utf-8"
);

module.exports = {
  defaultLibrary,
  build: (library = defaultLibrary, routes = null) =>
    merge(
      {
        framework: "next",
        frameworkName: "Next",
        firstCommand: "npm run dev",
        projectTests: [
          {
            arg: "-d",
            path: "pages",
            reason: "No `pages` folder found",
          },
        ],
        bootstraper: ["npx", ["create-react-app"]],
        dependencies: [
          "prismic-javascript",
          "prismic-reactjs",
          "next-slicezone",
          "next-transpile-modules",
        ],
        files: [
          {
            name: "_app.js",
            path: "./pages",
            content: Mustache.render(_app, library),
          },
          {
            name: "_document.js",
            path: "./pages",
            content: Mustache.render(_document),
          },
          {
            name: "next.config.js",
            path: "./",
            content: Mustache.render(nextConfig, library),
          },
          {
            name: "prismic.js",
            path: "./",
            content: Mustache.render(prismic, JSON.stringify(routes)),
          },
          {
            name: "sm-resolver.js",
            path: "./",
            content: Mustache.render(smResolver),
          },
        ],
      },
      library
    ),
};
