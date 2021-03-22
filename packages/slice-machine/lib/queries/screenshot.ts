import fs from 'fs'
import path from 'path'
import glob from 'glob'

const { acceptedImagesTypes } = require('../consts')

export function createPathToScreenshot({ cwd, from, sliceName, variationId }: { cwd: string, from: string, sliceName: string, variationId: string}): string {
  return path.join(cwd, '.slicemachine/assets', from, sliceName, variationId, 'preview.png')
}

export function getPathToScreenshot({ cwd, from, sliceName, variationId }: { cwd: string, from: string, sliceName: string, variationId: string}): { exists: boolean, defaultPath?: string, path?: string, isCustom: boolean } {
  const slicePath = path.join(cwd, from, sliceName, variationId)
  const exists = glob.sync(`${slicePath}/preview.@(${acceptedImagesTypes.join('|')})`)
  if (exists.length) {
    return {
      exists: true,
      path: exists[0],
      isCustom: true
    }
  }
  const defaultPath = createPathToScreenshot({ cwd, from, sliceName, variationId })
  return {
    exists: false,
    path: fs.existsSync(defaultPath) ? defaultPath : undefined,
    defaultPath,
    isCustom: false
  }
}
