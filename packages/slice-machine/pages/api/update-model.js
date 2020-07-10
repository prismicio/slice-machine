import fs from 'fs'
import path from 'path'
import getConfig from "next/config";

import mock from '../../lib/mock'

const { publicRuntimeConfig: config } = getConfig()

export default async function handler(req, res) {
  const { sliceName, from, model: strModel } = req.query
  const model = JSON.parse(strModel)

  const rootPath = path.join(config.cwd, from, sliceName)
  const mockPath = path.join(rootPath, 'mock.json')
  const modelPath = path.join(rootPath, 'model.json')

  const mockedSlice = mock(sliceName, model)
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
  fs.writeFileSync(mockPath, JSON.stringify(mockedSlice), 'utf-8')

  return res.status(200).send({ done: true })
}