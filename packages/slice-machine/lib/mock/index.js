import fs from 'fs'
import path from 'path'
import { getEnv } from '../env'
import * as Widgets from './widgets'

import { snakelize } from 'sm-commons/utils/str'

const createEmptyMock = (sliceName, variation) => ({
  ...variation,
  slice_type: snakelize(sliceName),
  items: [],
  primary: {}
})

const handleFieldMock = (widget, maybeFieldMock = {}, config) => {
  if (maybeFieldMock.content) {
    const { handleMockContent } = widget
    if (handleMockContent) {
      return handleMockContent(maybeFieldMock.content, config)
    }
    return maybeFieldMock.content
  }
  const { handleMockConfig } = widget
  if (handleMockConfig) {
    return handleMockConfig(maybeFieldMock.config || {}, config)
  }
  // console.warn(`[slice-machine] "config" property for field type "${widget.TYPE_NAME}" is not yet supported.`)
  return widget.createMock ? widget.createMock(config || {}) : null
}

const handleFields = (fields = [], mocks) => {
  return fields.reduce((acc, [key, value]) => {
    const widget = Widgets[value.type]
    const maybeFieldMock = mocks[key]

    if (widget) {
      const mock = handleFieldMock(widget, maybeFieldMock, value.config)
      return {
        ...acc,
        [key]: mock
      }
    }
    console.warn(`[slice-machine] Could not create mock for type "${value.type}": not supported.`)
    return acc
  }, {})
}

const getConfig = (cwd) => {
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
    mock.primary = handleFields(
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
      items.push(handleFields(repeat, config[sliceName] || {}))
    }
    mock.items = items
    return mock

  })
  
  return variations
}