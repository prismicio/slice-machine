import fs from 'fs'
import path from 'path'

const SM_CONFIG_FILE = "sm.config.json";

export function getInfoFromPath(libPath: string, startPath: string): any {
  const isLocal = ['@/', '~', '/'].find((e) => libPath.indexOf(e) === 0) !== undefined
  const pathToLib = path.join(
    startPath || process.cwd(),
    isLocal ? '' : 'node_modules',
    isLocal ? libPath.substring(1, libPath.length) : libPath,
  )
  const pathToConfig = path.join(pathToLib, SM_CONFIG_FILE)
  const pathExists = fs.existsSync(pathToLib)

  let config: any = {}
  if (fs.existsSync(pathToConfig)) {
    config = JSON.parse(fs.readFileSync(pathToConfig) as any)
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