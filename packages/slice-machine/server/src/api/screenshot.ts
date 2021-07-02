import { getEnv } from '../../../lib/env'
import { Preview } from '../../../lib/models/common/Component'
import Previews from './previews'

export default async function handler({ from, sliceName }: { from: string, sliceName: string }): Promise<ReadonlyArray<Preview>> {
  const { env } = await getEnv()
  const generatedPreviews = await Previews.generateForSlice(env, from, sliceName)
  const failedPreviewsIds = generatedPreviews.filter(p => !p.hasPreview).map(p => p.variationId)
  if (failedPreviewsIds?.length) {
    console.error(`Cannot generate previews for variations: ${failedPreviewsIds.join(' | ')}`)
  }

  const mergedPreviews = Previews.mergeWithCustomScreenshots(generatedPreviews, env, from, sliceName)

  return mergedPreviews.filter(p => p.hasPreview) as ReadonlyArray<Preview>
}