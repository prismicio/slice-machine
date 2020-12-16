import fs from 'fs'
import path from 'path'
import base64Img from 'base64-img'

import { getPathToScreenshot } from '../../lib/queries/screenshot'
import { getEnv } from '../../lib/env'

export default async function handler({ from, sliceName, img }) {
  const { env } = await getEnv()

  const { path: filePath, isCustom } = getPathToScreenshot({ cwd: env.cwd, from, sliceName })

  if (isCustom) {
    fs.unlinkSync(filePath)
  }

  const pathToFile = path.join(env.cwd, from, sliceName)
  base64Img.imgSync(img, pathToFile, 'preview')

  return { previewUrl: img }
}