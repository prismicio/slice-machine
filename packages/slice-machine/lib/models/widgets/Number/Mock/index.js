import { createDefaultHandleMockContentFunction } from '../../../../utils'

export const initialValues = null

export const handleMockConfig = () => Math.floor(Math.random() * 9999)

export const handleMockContent = createDefaultHandleMockContentFunction({ handleMockConfig }, 'Number', v => typeof v === 'number')