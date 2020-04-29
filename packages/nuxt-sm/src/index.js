const path = require('path')
const logger = require('./logger')
const { getInfoFromPath: getLibraryInfo } = require('sm-commons/methods/lib')
const libraries = ['@/slices', 'vue-essential-slices']


function install(moduleOptions) {
  const options = {
    ...moduleOptions,
    ...(this.options.prismic || {}),
    ...(this.options.sliceMachine || {}),
  }

  libraries.forEach(async(libPath) => {
    const {
      config,
      isLocal,
      pathToLib,
      pathToSlices,
    } = await getLibraryInfo(libPath)

    console.log({
      [libPath]: {
        config,
        isLocal,
        pathToLib,
        pathToSlices,
      }
    })
  })
  this.addPlugin({
    fileName: 'prismic/sm-resolver.js',
    src: path.resolve(__dirname, 'sm-resolver.js'),
    options,
  })

  // logger.warn('Please create ~/app/prismic/link-resolver.js');
}

module.exports = install;
module.exports.meta = require('../package.json');
