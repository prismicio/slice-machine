import { getEnv } from '../../../../lib/env'
import { snakelize } from '../../../../lib/utils/str'

import { getEnv } from '../../../../lib/env'
import Files from '../../../../lib/utils/files'

import { getPathToScreenshot } from '../../../../lib/queries/screenshot'


import { purge, upload } from '../upload'
import DefaultClient from '../../../../lib/models/common/http/DefaultClient'
import FakeClient, { FakeResponse } from '../../../../lib/models/common/http/FakeClient'
// import { Variation, AsObject } from '../../../../lib/models/common/Variation'
// import Slice from '../../../../lib/models/common/Slice'
// import { CustomPaths } from '../../../../lib/models/paths'

import { handleLibraryPath } from '../../../../lib/queries/listComponents'

const onError = (r: Response | FakeResponse, message = 'An error occured while pushing slice to Prismic') => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
})

const getSlices = async(client: DefaultClient | FakeClient) => {
  try {
    const res = await client.getSlice()
    if (res.status !== 200) {
      return { err: res, slices: [] }
    }
    const slices = await res.json()
    return { err: null, slices }
  } catch(e) {
    return { slices: [], err: e }
  }
}

export default async function handler(query: { from: string }) {
  const { from } = query
  const { env } = await getEnv()
  const { slices, err } = await getSlices(env.client)
  if (err) {
    console.error('[push] An error occured while fetching slices.\nCheck that you\'re properly logged in and that you have access to the repo.')
    return onError(err, `Error ${err.status}: Could not fetch remote slices`)
  }

  const maybeLib = await handleLibraryPath(env, from)
  
  if (maybeLib) {
    const { components } = maybeLib
    for (let slice of components) {
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
