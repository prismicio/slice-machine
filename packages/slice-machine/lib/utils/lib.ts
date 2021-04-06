import path from 'path'
import Files from './files'

const SM_CONFIG_FILE = "sm.config.json";

export function getInfoFromPath(libPath: string, startPath: string): any {
  const isLocal = ['@/', '~', '/'].find((e) => libPath.indexOf(e) === 0) !== undefined
  const pathToLib = path.join(
    startPath || process.cwd(),
    isLocal ? '' : 'node_modules',
    isLocal ? libPath.substring(1, libPath.length) : libPath,
  )
  const pathToConfig = path.join(pathToLib, SM_CONFIG_FILE)
  const pathExists = Files.exists(pathToLib)

  let config: any = {}
  if (Files.exists(pathToConfig)) {
    config = Files.readJson(pathToConfig)
  }
  const pathToSlices = path.join(
    pathToLib,
    config.pathToLibrary || '.',
    config.slicesFolder || (isLocal ? '.' : 'slices')
  )
  return {
    config,
    isLocal,
    pathExists,
    pathToLib,
    pathToSlices,
  }
}