import { getPathToScreenshot } from '../../../lib/queries/screenshot'
import { getEnv } from '../../../lib/env'
import { CustomPaths } from '../../../lib/models/paths'
import Files from '../../../lib/utils/files'

export default async function handler(file: File & { path: string }, { from, sliceName, variationId }: { from: string, sliceName: string, variationId: string }) {
  const { env } = await getEnv()

  const activeScreenshot = getPathToScreenshot({ cwd: env.cwd, from, sliceName, variationId })
  if (activeScreenshot && activeScreenshot.isCustom) {
    Files.remove(activeScreenshot.path)
  }

  const previewPath = CustomPaths(env.cwd)
    .library(from)
    .slice(sliceName)
    .variation(variationId)
    .preview(`preview.${file.type.split('/')[1]}`)
  
  Files.copy(file.path, previewPath, { recursive: true })

  return {
    isCustomPreview: true,
    hasPreview: true,
    url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(previewPath)}&uniq=${Math.random()}`
  }
}