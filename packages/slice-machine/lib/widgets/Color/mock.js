import { createDefaultHandleMockContentFunction } from '../../utils'

export const createMock = () => `#${Math.floor(Math.random()*16777215).toString(16)}`

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Color')
