const path = require("path");
module.exports = {
  distDir: "build/client",
  env: {
    CWD: path.resolve("tests/project"),
  },
  webpack: (config, { isServer }) => {
    return config;
  },
};