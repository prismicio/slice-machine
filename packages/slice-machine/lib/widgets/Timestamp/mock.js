import { createDefaultHandleMockContentFunction } from '../../utils'

const randomDate = (start = new Date(2012, 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

export const createMock = () => randomDate()

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Timestamp')