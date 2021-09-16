import { createDefaultHandleMockContentFunction } from '../../../../../utils'

export const initialValues = {
  content: null
}

const randomDate = (start = new Date(2012, 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()

export const handleMockConfig = () => randomDate()

export const handleMockContent = createDefaultHandleMockContentFunction({ handleMockConfig }, 'Timestamp', (v) => v)