import { getEnv } from './env'
import * as Widgets from './widgets'

import { snakelize } from 'sm-commons/utils/str'

const createEmptyMock = (sliceName, variation) => ({
  ...variation,
  slice_type: snakelize(sliceName),
  items: [],
  primary: {}
})

const handleFields = (fields = [], sliceName, userDefinedMocks) => {
  return fields.reduce((acc, [key, value]) => {
    const widget = Widgets[value.type]

    const maybeMock = userDefinedMocks[sliceName] && userDefinedMocks[sliceName][key] 
    ? userDefinedMocks[sliceName][key]
    : userDefinedMocks[value.type]

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

  const { env: { mocks = {} } } = getEnv()

  const variations = model.variations.map(variation => {
    const mock = createEmptyMock(sliceName, variation)
    mock.primary = handleFields(
      Object.entries(variation.primary),
      sliceName,
      mocks
    )

    const repeat = Object.entries(variation.items)
    if (repeat.length === 0) {
      return mock
    }

    const items = []
    for (let i = 0; i < Math.floor(Math.random() * 6) + 1; i++) {
      items.push(handleFields(repeat, sliceName, mocks))
    }
    mock.items = items
    return mock

  })
  
  return variations
}