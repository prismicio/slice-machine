import fs from 'fs'
import path from 'path'
import getConfig from 'next/config'
import initClient from 'lib/client'

const { publicRuntimeConfig: config } = getConfig()
const client = initClient('shared', config.dbId)

// async function create({ sliceName, from, model }) {
//   const res = await client.insert(model)

//   if (res.status !== 201) {
//     await client.update(model)
//   }

//   fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
// }

export default async function handler(req, res) {
  console.log('this')
  const { sliceName, from, create = false } = req.query
  console.log(create, typeof create, Boolean("false"))
  const rootPath = path.join(config.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')
  const model = fs.readFileSync(modelPath, 'utf-8')
  if (Boolean(create)) {
    const r = await client.insert(model)
    console.log({ status: r.status, r })
  } else {
    const res = await client.update(model)
    console.log(res, res.status)
  }


  return res.status(200).send({ isModified: false, isNew: false })
}