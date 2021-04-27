import { createDefaultHandleMockContentFunction } from '../../../utils'
import faker from 'faker'

export const initialValues = {
  content: null
}

export const handleMockConfig = () => faker.company.bs()

export const handleMockContent = createDefaultHandleMockContentFunction({ handleMockConfig }, 'Text', (v) => typeof v === 'string' && v.length)