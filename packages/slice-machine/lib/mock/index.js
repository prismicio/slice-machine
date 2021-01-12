import fs from 'fs'
import path from 'path'
import { getEnv } from '../env'
import * as Widgets from './widgets'

import { snakelize } from 'sm-commons/utils/str'

import { handleFields } from './handlers'

const createEmptyMock = (sliceName, variation) => ({
  ...variation,
  slice_type: snakelize(sliceName),
  items: [],
  primary: {}
})

export const getConfig = (cwd) => {
  const pathToMocks = path.join(cwd, '.slicemachine/mocks.json')
  if (fs.existsSync(pathToMocks)) {
    return JSON.parse(fs.readFileSync(pathToMocks))
  }
  return {}
}

export default async (sliceName, model) => {

  const { env: { cwd } } = await getEnv()
  const config = getConfig(cwd)

  const variations = model.variations.map(variation => {
    const mock = createEmptyMock(sliceName, variation)
    const handler = handleFields(Widgets)
    mock.primary = handler(
      Object.entries(variation.primary),
      config[sliceName] || {}
    )

    const items = []
    const repeat = Object.entries(variation.items)
    if (repeat.length === 0) {
      return {
        ...mock,
        items,
      }
    }

    for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
      items.push(handler(repeat, config[sliceName] || {}))
    }
    mock.items = items
    return mock

  })
  
  return variations
}