import { Timestamp } from '../../../mock/widgets'
import { createDefaultHandleMockContentFunction } from '../../../utils'

export const createMock = () => Timestamp.createMock().split('T')[0]

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Date')
