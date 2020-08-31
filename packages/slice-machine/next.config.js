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

    config.resolve.alias['src'] = path.join(__dirname, 'src')
    config.resolve.alias['lib'] = path.join(__dirname, 'lib')
    config.resolve.alias['components'] = path.join(__dirname, 'components')

    return config
  }
};