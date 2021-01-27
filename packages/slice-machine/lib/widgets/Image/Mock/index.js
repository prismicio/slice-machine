import { Computer } from './dataset'

export const initialValues = {
  content: null
}

const createImageArray = ({ src: intialSrc }, constraint = {}, thumbnails = []) => {
  const { width = 900, height = 500 } = constraint
  const src = intialSrc || Computer[Math.floor(Math.random() * Computer.length).raw.split('?')[0]]
  return {
    dimensions: { width, height },
    alt: 'Placeholder image',
    copyright: null,
    url: `${src}?w=${width}&h=${height}&fit=crop`,
    ...thumbnails.reduce((acc, e, i) => ({
      ...acc,
      [e.name]: createImageArray({ src }, { width: e.width, height: e.height })
    }), [])
  }
}

export const handleMockContent = (mockContent, { constraint, thumbnails }) => {
  if (Array.isArray(mockContent)) {
    return mockContent
  }
  const args = [
      {
        src: mockContent,
      },
      constraint,
      thumbnails
    ]
    return createImageArray(...args)
}

export const handleMockConfig = (_, model) => handleMockContent(null, model)