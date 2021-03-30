import fs from 'fs'
import path from 'path'

import { getPathToScreenshot } from '../../../lib/queries/screenshot'
import { getEnv } from '../../../lib/env'

export default async function handler(file, { from, sliceName, variationId, img }) {
  const { env } = await getEnv()

  const { path: filePath, isCustom } = getPathToScreenshot({ cwd: env.cwd, from, sliceName, variationId })
  if (isCustom) {
    fs.unlinkSync(filePath)
  }

  const destFolder = path.join(env.cwd, from, sliceName, variationId)
  const dest = path.join(destFolder, `preview.${file.type.split('/')[1]}`)
  fs.mkdirSync(destFolder, { recursive: true })
  fs.copyFileSync(file.path, dest)

  return {
    isCustomPreview: true,
    hasPreview: true,
    url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(dest)}&uniq=${Math.random()}`
  }
}