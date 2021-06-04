import { getEnv } from '../../../lib/env'
import { Preview } from '../../../lib/models/common/Component'
import previews from './previews'

export default async function handler({ from, sliceName }: { from: string, sliceName: string }): Promise<ReadonlyArray<Preview>> {
  const { env } = await getEnv()
  const generatedPreviews = await previews.generateForSlice(env, from, sliceName)
  const failedPreviewsIds = generatedPreviews.filter(p => !p.hasPreview).map(p => p.variationId)
  console.error(`Cannot generate previews for variations: ${failedPreviewsIds.join(' | ')}`)

  return generatedPreviews.filter(p => p.hasPreview) as ReadonlyArray<Preview>
}