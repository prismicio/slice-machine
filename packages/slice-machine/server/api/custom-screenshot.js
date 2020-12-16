import path from 'path'
import base64Img from 'base64-img'

import { getEnv } from '../../lib/env'

export default async function handler({ from, sliceName, img }) {
  const { env } = await getEnv()

  const pathToFile = path.join(env.cwd, from, sliceName)
  base64Img.imgSync(img, pathToFile, 'preview')

  return { previewUrl: img }
}