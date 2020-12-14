import { createDefaultHandleMockContentFunction } from '../../utils'

export const createMock = () => Math.floor(Math.random() * 9999)

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Number', 'number')