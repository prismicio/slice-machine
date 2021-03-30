import fs from 'fs'
import path from 'path'
import uniqid from 'uniqid'
import { snakelize } from '../../../lib/utils/str'

import { getEnv } from '../../../lib/env'

import { getPathToScreenshot } from '../../../lib/queries/screenshot'

import { s3DefaultPrefix } from '../../../lib/consts'

import { purge, upload } from './upload'

const onError = (r, message = 'An error occured while pushing slice to Prismic') => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
})

const createOrUpdate = async ({
  slices,
  sliceName,
  model,
  client
}) => {
  if (slices.find(e => e.id === snakelize(sliceName))) {
    return await client.update(model)
  } else {
    return await client.insert(model)
  }
}

const getSlices = async(client) => {
  try {
    const res = await client.get()
    if (res.status !== 200) {
      return { err: res, slices: [] }
    }
    const slices = await res.json()
    return { err: null, slices }
  } catch(e) {
    return { slices: [], err: e }
  }
}

export default async function handler(query) {
  const { sliceName, from } = query
  const { env } = await getEnv()
  const { slices, err } = await getSlices(env.client)
  if (err) {
    console.error('[push] An error occured while fetching slices.\nCheck that you\'re properly logged in and that you have access to the repo.')
    return onError(err, `Error ${err.status}: Could not fetch remote slices`)
  }
  const rootPath = path.join(env.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')

  try {
      const jsonModel = JSON.parse(model)
      const { err } = purge(env, slices, sliceName, onError)
      if(err) return err
      
      const variationIds = jsonModel.variations.map(v => v.id)
      
      let imageUrlsByVariation = {}

      for(let i = 0; i < variationIds.length; i += 1) {
        const variationId = variationIds[i]
        const { path: pathToImageFile } = getPathToScreenshot({ cwd: env.cwd, from, sliceName, variationId })
        const { err, s3ImageUrl } = await upload(env, sliceName, variationId, pathToImageFile, onError)
        if(err) throw new Error(err.reason)
        imageUrlsByVariation[variationId] = s3ImageUrl
      }
  
      console.log('[push]: pushing slice model to Prismic')
      const res = await createOrUpdate({
        slices,
        sliceName,
        model: {
          ...jsonModel,
          variations: jsonModel.variations.map(v => ({ ...v, imageUrl: imageUrlsByVariation[v.id] }))
        },
        client: env.client
      })
      if (res.status > 209) {
        const message = res.text ? await res.text() : res.status
        console.error(`[push] Unexpected error returned. Server message: ${message}`)
        throw new Error(message)
      }
      console.log('[push] done!')
      return {}
    } catch(e) {
      console.log(e)
      return onError(e, 'An unexpected error occured while pushing slice')
    }
}