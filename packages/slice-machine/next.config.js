const userConfig = require('./conf.json')

module.exports = {
  publicRuntimeConfig: userConfig,
  webpack: (config, {
    isServer
  }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
    }

    return config
  }
};