// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  distDir: "build/client",
  env: {
    // overridden by start script
    CWD: path.resolve("tests/project"),
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       child_process: false,
  //       fs: false,
  //     };
  //   }
  //   config.module.rules.push({
  //     test: /\.svg$/i,
  //     issuer: /\.[jt]sx?$/,
  //     use: ["@svgr/webpack"],
  //   });
  //   return config;
  // },
};
