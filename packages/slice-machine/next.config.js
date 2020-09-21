const path = require('path')
const userConfig = require('../../sm.json')

console.log(process.env.NODE_ENV)
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