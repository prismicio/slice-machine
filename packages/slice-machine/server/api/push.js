import fs from 'fs'
import path from 'path'
import { snakelize } from 'sm-commons/utils/str'

import { getEnv } from '../../lib/env'

import { getPathToScreenshot } from '../../lib/queries/screenshot'

import { s3DefaultPrefix } from '../../src/consts'

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
    console.error('[api/slices] An error occured while fetching slices.\nCheck that you\'re properly logged in and that you have access to the repo.')
    return onError(err, `Error ${err.status}: Could not fetch remote slices`)
  }
  const rootPath = path.join(env.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')

  try {
      const jsonModel = JSON.parse(model)
      const { path: pathToImageFile } = getPathToScreenshot({ cwd: env.cwd, from, sliceName })

      if (!pathToImageFile) {
        const msg = 'Screenshot not found. Please check that file exists in slice folder or in .slicemachine assets'
        console.log(msg)
        return {
          err: new Error(msg),
          status: 400,
          message: msg,
        }
      }

      const deleteRes = await env.client.images.deleteFolder({ sliceName: snakelize(sliceName) })

      if (deleteRes.status > 209) {
        const msg = 'An error occured while purging slice folder - please contact support'
        console.error(msg)
        return onError(deleteRes, msg)
      }

      const aclResponse = await (await env.client.images.createAcl()).json()
      const maybeErrorMessage = aclResponse.error || aclResponse.Message || aclResponse.message
      if (maybeErrorMessage) {
        const msg = maybeErrorMessage || 'An error occured while creating ACL - please contact support'
        console.error(msg)
        console.error(`Full error: ${JSON.stringify(aclResponse)}`)
        return onError(aclResponse, msg)
      }
      const { values: { url, fields }, bucketEndpoint } = aclResponse

      const filename = path.basename(pathToImageFile)
      const key = `${env.repo}/${s3DefaultPrefix}/${snakelize(sliceName)}/${filename}`
      const postStatus = await env.client.images.post({
        url,
        fields,
        key,
        filename,
        pathToFile: pathToImageFile,
      })

      const s3ImageUrl = `${bucketEndpoint}${key}`

      if (postStatus !== 204) {
        const msg = 'An error occured while uploading files - please contact support'
        console.error(msg)
        console.error(`Error code: "${postStatus}"`)
        return onError(null, msg)
      }

      const res = await createOrUpdate({
        slices,
        sliceName,
        model: { ...jsonModel, imageUrl: s3ImageUrl },
        client: env.client
      })
      if (res.status > 209) {
        const message = res.text ? await res.text() : res.status
        console.error(`[push] Unexpected error returned. Server message: ${message}`)
        return onError(res)
      }
      return {
        isModified: false,
        isNew: false,
      }
    } catch(e) {
      return onError(e, 'An unexpected error occured while pushing slices')
    }
}