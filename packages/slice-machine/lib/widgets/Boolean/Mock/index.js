import { createDefaultHandleMockContentFunction } from '../../../utils'

export const initialValues = {
  content: true
}

export const handleMockConfig = (_, config) => {
  if (config && config.default_value !== null) {
    return config.default_value
  }
  return Math.random() < 0.50 ? true : false
}

export const handleMockContent = createDefaultHandleMockContentFunction({ handleMockConfig }, 'Boolean', (v) => typeof v === 'boolean')