import fs from 'fs'
import path from 'path'
import { getConfig } from 'lib/config'
import initClient from 'lib/client'

import { snakelize } from 'sm-commons/utils/str'
import { getSlices } from './slices'

const { config } = getConfig()
const client = initClient(config.repo, config.dbId)

const onError = (r, response) => response.status(r.status).send({ message: 'An error occured while pushing slice to Prismic', err: r })

export default async function handler(req, res) {
  const { sliceName, from } = req.query

  const { slices, err } = await getSlices()
  if (err) {
    return res.status(500).send({ message: 'Could not fetch remote slices' })
  }
  const rootPath = path.join(config.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')
  if (slices.find(e => e.id === snakelize(sliceName))) {
    const r = await client.update(model)
    if (r.status > 209) {
      return onError(r, res)
    }
  } else {
    const r = await client.insert(model)
    if (r.status !== 209) {
      return onError(r, res)
    }
  }

  return res.status(200).send({ isModified: false, isNew: false })
}