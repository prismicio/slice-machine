import { createDefaultHandleMockContentFunction } from '../../utils'

export const createMock = () => Math.random() < 0.50 ? true : false

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Boolean', 'boolean')