import fs from 'fs'
import path from 'path'

export const getConfig = (cwd) => {
  const pathToMocks = path.join(cwd, '.slicemachine/mocks.json')
  if (fs.existsSync(pathToMocks)) {
    return JSON.parse(fs.readFileSync(pathToMocks))
  }
  return {}
}

export const writeConfig = (cwd, config) => {
  if (!fs.existsSync(path.join(cwd, '.slicemachine'))) {
     fs.mkdirSync(path.join(cwd, '.slicemachine'))
  }
  const pathToMocks = path.join(cwd, '.slicemachine/mocks.json')
  fs.writeFileSync(pathToMocks, JSON.stringify(config, null, 2))
}

export const insert = (cwd, { key, value }) => {
  const config = getConfig(cwd)
  const withInsert = {
    ...config,
    [key]: value
  }
  writeConfig(cwd, withInsert)
  return withInsert
}