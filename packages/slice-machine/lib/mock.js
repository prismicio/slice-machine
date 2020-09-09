import getConfig from "next/config";
import * as Widgets from './widgets'

import { snakelize } from 'sm-commons/utils/str'

const { publicRuntimeConfig: config } = getConfig();

const { mocks = {} } = config

const createEmptyMock = (sliceName, variation) => ({
  ...variation,
  slice_type: snakelize(sliceName),
  items: [],
  primary: {}
})

const handleFields = (fields = [], sliceName) => {
  return fields.reduce((acc, [key, value]) => {
    const widget = Widgets[value.type]

    const maybeMock = mocks[sliceName] && mocks[sliceName][key] 
    ? mocks[sliceName][key]
    : mocks[value.type]

    if (widget) {
      return {
        ...acc,
        [key]: widget.createMock(maybeMock, value.config || {})
      }
    }
    console.warn(`[slice-machine] Could not create mock for type "${value.type}": not supported yet.`)
    return acc
  }, {})
}

export default (sliceName, model) => {

  const variations = model.variations.map(variation => {
    const mock = createEmptyMock(sliceName, variation)
    mock.primary = handleFields(
      Object.entries(variation.primary),
      sliceName
    )

    const repeat = Object.entries(variation.items)
    if (repeat.length === 0) {
      return mock
    }

    const items = []
    for (let i = 0; i < Math.floor(Math.random() * 6) + 1; i++) {
      items.push(handleFields(repeat, sliceName))
    }
    mock.items = items
    return mock

  })
  
  return variations
}