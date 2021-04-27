import { createDefaultHandleMockContentFunction } from '../../../utils'

export const initialValues = null

export const handleMockConfig = (_, config) => {
  if (config.default_value && Math.random() < 0.50) {
    return config.default_value
  }
  const index = Math.floor(Math.random() * config.options.length)
  return config.options[index]
}

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  'Select',
  (v, config) => typeof v === 'string' && config.options.indexOf(v) !== -1
)