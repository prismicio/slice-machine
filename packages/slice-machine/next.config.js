const path = require('path')
const withPlugins = require('next-compose-plugins');
const withMDX = require('@next/mdx')()
const withCustomBabelConfigFile = require('next-plugin-custom-babel-config');

module.exports = withPlugins([
  [withCustomBabelConfigFile, {
    babelConfigFile: path.resolve("./babel.config.js"),
    env: {
      // overriden by start script
      CWD: path.resolve("./tests/project"),
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.node = {
          fs: "empty",
        };
      }
      config.resolve.alias['@'] = __dirname
      config.resolve.alias.src= path.join(__dirname, "src");
      config.resolve.alias.lib= path.join(__dirname, "lib");
      config.resolve.alias.components= path.join(__dirname, "components");

      config.module.rules.push({
        test: /\.svg$/,
        issuer: {
          test: /\.(js|ts)x?$/,
        },
        use: ["@svgr/webpack"],
      });

      return config;
    },
  }],
  [withMDX]
])