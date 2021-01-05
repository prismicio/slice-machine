import * as Widgets from '../lib/widgets'
import { handleFields } from '../lib/mock/handlers'
import { model, createExpector } from './__mockData__/models'

const mockFields = handleFields(Widgets)

test('Can create mocks', () => {
  const primary = Object.entries(model.variations[0].primary)
  const mockEntries = Object.entries(mockFields(primary))
  expect(mockEntries.length).toBe(primary.length)

  const expector = createExpector(expect)
  mockEntries.forEach(([key, value]) => expector[key] ? expector[key](value) : null)

})