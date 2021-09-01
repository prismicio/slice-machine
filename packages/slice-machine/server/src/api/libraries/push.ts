import { getEnv } from '../../../../lib/env'

import { getSlices } from '../slices'
import { onError } from '../common/error'

import { purge } from '../upload'

import { handleLibraryPath } from '../../../../lib/queries/listComponents'

export default async function handler(query: { from: string }) {
  const { from } = query
  const { env } = await getEnv()
  const { slices, err } = await getSlices(env.client)
  if (err) {
    console.error('[push] An error occured while fetching slices.\nCheck that you\'re properly logged in and that you have access to the repo.')
    return onError(err, `Error ${err.status}: Could not fetch remote slices. Please log in to Prismic!`)
  }

  const maybeLib = await handleLibraryPath(env, from)
  
  if (maybeLib) {
    const { components } = maybeLib
    for (let slice of components) {
      const { err } = await purge(env, slices, slice.infos.sliceName, onError)
      if(err) {
        console.error(err)
        return { err }
      }
      const variations = slice.model.variations.map(v => ({
        ...v,
        imageUrl: slice.infos.previewUrls?.[v.id].url
      }))
      const model = {
        ...slice.model,
        imageUrl: variations[0].imageUrl,
        variations,
      }
      console.log({ model })
    }
  }

  return {}
}
