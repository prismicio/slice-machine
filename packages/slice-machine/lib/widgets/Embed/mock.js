import { createDefaultHandleMockContentFunction } from '../../utils'

export const createMock = () => `https://www.youtube.com/watch?v=7SgFFT1Bv78&ab_channel=Prismic`

export const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, 'Embed')
