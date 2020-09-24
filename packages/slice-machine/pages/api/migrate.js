import fs from 'fs'
import path from 'path'
import { getConfig } from 'lib/config'
import { getLibrariesWithFlags } from './libraries'
import initClient from 'lib/client'

const { config } = getConfig()
const client = initClient(config.repo, config.dbId)

async function migrate(slices, index = 0) {
  if (!slices[index]) {
    return
  }
  const {
    model,
    isNew,
    sliceName,
    from
  } = slices[index]
  // if (isNew) {
  //   await client.insert(model)
  // } else {
  //   await client.update(model)
  // }
  const rootPath = path.join(config.cwd, from, sliceName)
  const modelPath = path.join(rootPath, 'model.json')

  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
  return await migrate(slices, index + 1)
}

export default async function handler(req, res) {
  const libraries = await getLibrariesWithFlags()
  const migrations = libraries.reduce((acc, [, slices]) => {
    const toMigrate = slices.filter(e => e.migrated)
    return [...acc, ...toMigrate]
  }, [])

  await migrate(migrations)
  return res.status(201).json({ done: true, error: null })
}