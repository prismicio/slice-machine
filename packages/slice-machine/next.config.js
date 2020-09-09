const path = require('path')
// const userConfig = require('./conf.json')

const p = '../../../examples/sm-ui-next/.slicemachine/config.json'
const userConfig = require(p)
console.log({ userConfig })

module.exports = {
  publicRuntimeConfig: {
    ...userConfig,
    cwd: path.resolve('../../../examples/sm-ui-next')
  },
  webpack: (config, {
    isServer
  }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
    }

    console.log('webpack : ', path.join(__dirname, 'src'))
    config.resolve.alias['src'] = path.join(__dirname, 'src')
    config.resolve.alias['lib'] = path.join(__dirname, 'lib')
    config.resolve.alias['components'] = path.join(__dirname, 'components')

    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ['@svgr/webpack'],
    });

    return config
  }
};