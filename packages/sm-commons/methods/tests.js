const fs = require('fs')
const path = require('path')
const consola = require('consola')
const expect = require('expect.js')

function pathExists(p, error, read) {
  try {
    if (fs.existsSync(p)) {
      return read ? fs.readFileSync(p, 'utf8') : true
    }
  } catch (err) {
    throw new Error(error)
  }
}

function isJSON(content) {
  try {
    const json = JSON.parse(content);
    return json;
  } catch (e) {
    throw new Error(e);
  }
}

function pathHasType(p, type, error) {
  if (type === 'f' || type === 'file') {
    return pathExists(p, error)
  }
  const isDirectory = fs.lstatSync(p).isDirectory()
  if (!isDirectory) {
    throw new Error(error)
  }
  return true
}

function smConfig(config) {
  expect(config).to.have.property('libraryName')
  expect(config).to.have.property('gitUrl')
  expect(config).to.have.property('framework')
}

function testMeta(meta) {
  expect(meta).to.be.an('object')
  expect(meta).to.have.property('title')
  expect(meta).to.have.property('description')
}

function testModel(model) {
  expect(model).to.be.an('object')
  expect(model).to.have.property('type', 'Slice')
  expect(model).to.have.property('fieldset')
  expect(model).to.have.property('description')
  expect(model).to.have.property('icon')
  expect(model).to.have.property('display')
  expect(model).to.have.property('non-repeat')
}

function isSliceFolder(p) {
  try {
    pathExists(path.join(p, "preview.png"))
    const meta = isJSON(pathExists(path.join(p, 'meta.json'), 'File "meta.json" does not exist.', true))
    const model = isJSON(
      pathExists(
        path.join(p, "model.json"),
        'File "model.json" does not exist.',
        true
      )
    )

    testModel(model)
    testMeta(meta)

  } catch(e) {
    consola.error(`slice-machine/isSliceFolder] Error while parsing slice folder, at path "${path}"`)
    consola.error(e)
  }
}

module.exports = {
  isSliceFolder,
  pathExists,
  smConfig,
  testModel,
  pathHasType
};