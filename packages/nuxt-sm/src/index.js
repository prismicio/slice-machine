const fs = require('fs')
const path = require('path')
const logger = require('./logger')
const { getInfoFromPath: getLibraryInfo } = require('sm-commons/methods/lib')
const { SM_FILE } = require('sm-commons/consts')

async function handleLibraryPath(libPath) {
  const {
    isLocal,
    pathExists,
    pathToSlices,
  } = await getLibraryInfo(libPath)

  if (!pathExists) {
    return logger.warn(`[nuxt-sm] path to library "${pathToSlices}" does not exist. Skipping.`)
  }

  let p = pathToSlices
  if (!isLocal) {
    const split = pathToSlices.split(libPath)
    p = path.join(libPath, split[split.length - 1])
  }
  return `import(\`${p}/\${sliceName}.vue\`), import(\`${p}/\${sliceName}/index.vue\`), import(\`${p}/\${sliceName}/index.js\`), import(\`${p}/\${sliceName}/\${sliceName}.vue\`)`;
  // fails on: import(\`${p}/\${sliceName}/\${sliceName}.js\`)` because of index.stories.js?
}

async function install(moduleOptions) {
  const options = {
    ...moduleOptions,
    ...(this.options.prismic || {}),
    ...(this.options.sliceMachine || {}),
  }

  const app = this.options.dir.app || ''

  const pathToResolver = options.pathToResolver || path.join(this.options.srcDir, app, 'sm-resolver.js')
  const resolverExists = fs.existsSync(pathToResolver)

  if (resolverExists) {
    this.addPlugin({
      fileName: 'prismic/sm-resolver.js',
      src: pathToResolver,
    })
  }

  const pathToSmFile = path.join(this.options.srcDir, SM_FILE)
  const smFile = fs.existsSync(pathToSmFile) ? JSON.parse(fs.readFileSync(pathToSmFile)) : {}

  const libraries = options.libraries || smFile.libraries

  if (!libraries) {
    return logger.warn('[nuxt-sm] expects a non-empty "libraries" array. If it was intended, consider removing the plugin from your config')
  }

  if (!Array.isArray(libraries) || !libraries.length) {
    return logger.error('[nuxt-sm] expects a "libraries" option to be a non-empty array')
  }
  
  const importPathString = (await Promise.all(
    libraries.map(async lib => await handleLibraryPath(lib))
  )).filter(e => e)
  const imports = `[ ${importPathString} ]`
  // , import('vue-slicezone/NotFound.vue')

  this.addPlugin({
    fileName: 'prismic/sm-resolver.js',
    src: path.resolve(__dirname, 'sm-resolver.js'),
    options: {
      imports
    }
  })
}

module.exports = install;
module.exports.meta = require('../package.json');
module.exports.handleLibraryPath = handleLibraryPath
