import fs from 'fs'
import path from 'path'
import base64Img from 'base64-img'
import { snakelize } from 'sm-commons/utils/str'

import { getEnv } from '../../lib/env'
import initClient from '../../lib/client'

import { getSlices } from './slices'

const onError = (r, message = 'An error occured while pushing slice to Prismic') => ({
  err: r,
  status: r.status,
  message,
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

export default async function handler(query) {
  const { sliceName, from } = query
  const { env } = await getEnv()
  const client = initClient(env)

  const { slices, err } = await getSlices()
  if (err) {
    return onError(err, 'Could not fetch remote slices')
  }
  const rootPath = path.join(env.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')

  try {
      const jsonModel = JSON.parse(model)
      const pathToImageFile = path.join(env.cwd, from, sliceName, 'preview.png')
      const imageUrl = base64Img.base64Sync(pathToImageFile)
      const res = await createOrUpdate({
        slices,
        sliceName,
        model: { ...jsonModel, imageUrl },
        client
      })
      if (res.status > 209) {
        const message = await res.text()
        console.error(`[push] Unexpected error returned. Server message: ${message}`)
        return onError(res)
      }
      return { isModified: false, isNew: false }
    } catch(e) {
      console.log({ e })
      return onError(e, 'An unexpected error occured while pushing slices')
    }
}