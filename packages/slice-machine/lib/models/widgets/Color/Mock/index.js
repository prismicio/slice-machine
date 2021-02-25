import { createDefaultHandleMockContentFunction } from '../../../../utils'

export const initialValues = null

export const handleMockConfig = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`
}

export const handleMockContent =
  createDefaultHandleMockContentFunction({ handleMockConfig }, 'Color', (v) => v.indexOf('#') === 0 && v.length === 7)