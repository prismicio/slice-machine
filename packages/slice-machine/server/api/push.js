import fs from 'fs'
import path from 'path'
import { snakelize } from 'sm-commons/utils/str'

import { getConfig } from '../../lib/config'
import initClient from '../../lib/client'

import { getSlices } from './slices'

const { config } = getConfig()
const client = initClient(config.repo, config.dbId)

const onError = (r, message = 'An error occured while pushing slice to Prismic') => ({
  err: r,
  status: r.status,
  message,
})

export default async function handler(query) {
  const { sliceName, from } = query

  const { slices, err } = await getSlices()
  if (err) {
    return onError(err, 'Could not fetch remote slices')
  }
  const rootPath = path.join(config.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')
  if (slices.find(e => e.id === snakelize(sliceName))) {
    const res = await client.update(model)
    if (res.status > 209) {
      return onError(res)
    }
  } else {
    const r = await client.insert(model)
    if (r.status !== 209) {
      return onError(res)
    }
  }

  return { isModified: false, isNew: false }
}