import Files from '../utils/files'
import { MocksConfig } from '../models/paths'

export const getConfig = (cwd) => {
  const pathToMockConfig = MocksConfig(cwd)
  if (Files.exists(pathToMockConfig)) {
    return Files.readJson(pathToMockConfig)
  }
  return {}
}

export const writeConfig = (cwd, config) => {
  Files.write(MocksConfig(cwd), config, { recursive: true })
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