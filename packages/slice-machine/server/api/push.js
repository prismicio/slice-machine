import fs from 'fs'
import path from 'path'
import base64Img from 'base64-img'
import { snakelize } from 'sm-commons/utils/str'

import { getConfig } from '../../lib/config'
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
  const { config } = getConfig()
  const client = initClient(config.repo, config.auth)

  const { slices, err } = await getSlices()
  if (err) {
    return onError(err, 'Could not fetch remote slices')
  }
  const rootPath = path.join(config.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')

  try {
      const jsonModel = JSON.parse(model)
      const pathToImageFile = path.join(config.cwd, from, sliceName, 'preview.png')
      const imageUrl = base64Img.base64Sync(pathToImageFile)
      const res = await createOrUpdate({
        slices,
        sliceName,
        model: { ...jsonModel, imageUrl },
        client
      })
      if (res.status > 209) {
        return onError(res)
      }
      return { isModified: false, isNew: false }
    } catch(e) {
      console.log({ e })
      return onError(e, 'An unexpected error occured while pushing slices')
    }
}