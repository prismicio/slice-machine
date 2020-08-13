const path = require('path')
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

    config.resolve.alias['components'] = path.join(__dirname, 'components')

    return config
  }
};