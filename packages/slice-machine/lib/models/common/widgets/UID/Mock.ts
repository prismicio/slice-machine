import faker from 'faker'
import { createDefaultHandleMockContentFunction } from '../../../../utils'

export const initialValues = null

export const handleMockConfig = () => faker.lorem.slug()

export const handleMockContent = createDefaultHandleMockContentFunction({ handleMockConfig }, 'UID', (v: any) => typeof v === 'string')