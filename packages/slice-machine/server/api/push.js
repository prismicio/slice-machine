import fs from 'fs'
import path from 'path'
import base64Img from 'base64-img'
import { snakelize } from 'sm-commons/utils/str'

import { getEnv } from '../../lib/env'

import { createPathToScreenshot } from '../../lib/queries/screenshot'

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

const getSlices = async(client) => {
  try {
    const res = await client.get()
    if (res.status !== 200) {
      return { err: res, slices: [] }
    }
    const slices = await res.json()
    return { err: null, slices }
  } catch(e) {
    console.log({ e })
    console.error('[api/slices] An error occured while fetching slices. Note that when stable, this should break!')
    return { slices: [] }
  }
}

export default async function handler(query) {
  const { sliceName, from } = query
  const { env } = await getEnv()
  const { slices, err } = await getSlices(env.client)
  if (err) {
    return onError(err, 'Could not fetch remote slices')
  }
  const rootPath = path.join(env.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')

  try {
      const jsonModel = JSON.parse(model)
      const pathToImageFile = createPathToScreenshot({ cwd: env.cwd, from, sliceName })
      // const aclResponse = await (await env.client.images.createAcl()).json()
      // if (aclResponse.error) {
      //   const msg = 'An error occured while creating ACL - please contact support'
      //   console.error(msg)
      //   console.error(`Full error: ${JSON.stringify(aclResponse)}`)
      //   return onError(e, msg)
      // }
      // const { values: { url: S3Url, fields: S3Fields } } = aclResponse


      // return { isModified: false, isNew: false }
      const imageUrl = base64Img.base64Sync(pathToImageFile)
      const res = await createOrUpdate({
        slices,
        sliceName,
        model: { ...jsonModel, imageUrl },
        client: env.client
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