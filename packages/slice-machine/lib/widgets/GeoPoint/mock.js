import { createDefaultHandleMockContentFunction } from '../../utils'

export const createMock = () => ``

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'GeoPoint')
