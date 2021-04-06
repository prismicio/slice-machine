import { CustomPaths, GeneratedPaths } from '../models/paths'
import Files from '../utils/files'

const { acceptedImagesTypes } = require('../consts')

export function getPathToScreenshot({ cwd, from, sliceName, variationId }: { cwd: string, from: string, sliceName: string, variationId: string}): { exists: boolean, path: string, isCustom: boolean } | undefined {
  const customPaths = acceptedImagesTypes.map((imageType: string) => {
    const previewPath = CustomPaths(cwd)
      .library(from)
      .slice(sliceName)
      .variation(variationId)
      .preview(`preview.${imageType}`)
    
      return {
        path: previewPath,
        options: {
          exists: true,
          isCustom: true
        }
      }
  })
  
  const defaultPath = {
    path: GeneratedPaths(cwd)
      .library(from)
      .slice(sliceName)
      .variation(variationId)
      .preview(),
    options: {
      exists: true,
      isCustom: false
    }
  }

  return Files.readFirstOf(customPaths.concat([defaultPath]))
}
