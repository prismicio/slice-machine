const path = require("path");
const withPlugins = require("next-compose-plugins");
const withMDX = require("@next/mdx")();
const withCustomBabelConfigFile = require("next-plugin-custom-babel-config");
const withVideos = require("next-videos");

module.exports = withPlugins(
  [
    [
      withCustomBabelConfigFile,
      {
        babelConfigFile: path.resolve("./babel.next.config.js"),
        webpack5: false,
        env: {
          // overridden by start script
          CWD: path.resolve("./tests/project"),
        },
        webpack: (config, { isServer }) => {
          if (!isServer) {
            config.node = { fs: "empty", child_process: "empty" };
          }

          config.module.rules.push({
            test: /\.svg$/,
            issuer: {
              test: /\.(js|ts)x?$/,
            },
            use: ["@svgr/webpack"],
          });

          return config;
        },
      },
    ],
    [withMDX],
    withVideos,
  ],
  {
    distDir: "./build/client",
  }
);
