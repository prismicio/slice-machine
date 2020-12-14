import { createDefaultHandleMockContentFunction } from '../../utils'

export const createMock = ({ label, placeholder }) => `A text labelled "${label}" that conveys ${placeholder || 'a message'}`

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Text')