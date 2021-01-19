import faker from 'faker'
import { LoremIpsum } from 'lorem-ipsum'

const isHeading = (type) => type.indexOf('heading') === 0

export const Defaults = {
  blocks: {
    min: 1,
    max: 3
  },
  sentencesPerParagraph: {
    min: 1,
    max: 3,
  },
  wordsPerSentence: {
    min: 4,
    max: 16,
  }
}

export const initialValues = {
  config: {
    patternType: '_',
    blocks: 1
  }
}

export const Patterns = {
  PARAGRAPH: {
    title: 'Paragraph',
    test: (options) => options.some(e => e === 'paragraph'),
    value: () => ['paragraph'],
    description: 'A single paragraph with a variant number of words.'
  },
  HEADING: {
    title: 'Heading',
    test: (options) => options.some(isHeading),
    value: (options) => [options.find(isHeading) || 'heading2'],
    description: 'A single heading (h1 to h6) with a variant number of words.'
  },
  PARAGRAPH_WITH_HEADING: {
    title: 'Paragraph with Heading',
    test: (options) => options.some(isHeading) && options.some(e => e === 'paragraph'),
    value: (options) => [options.find(isHeading) || 'heading2', 'paragraph'],
    description: 'A combination of heading (h1 to h6) with a single paragraph.'
  },
  _: {
    title: 'Paragraph or Heading',
    test: () => true,
    value: (options) => [options.find(isHeading) || 'paragraph'],
    description: 'One element random, that could be paragraph or heading'
  },
}

const createMockFromConfig = (blocksLen, pattern, config) => {
  const lorem = new LoremIpsum(config)
  const content = Array(blocksLen).fill().map(() => {
    return pattern.map(contentType => {
      const text = (() => {
        if (isHeading(contentType)) {
          const fake = faker.company.bs()
          return [fake[0].toUpperCase(), ...fake.slice(1)].join('')
        }
        return lorem.generateParagraphs(1)
      })()
      return {
        type: contentType,
        text,
        spans: []
      }
    })
  })
  return content.flat()

}

export const handleMockConfig = (mockConfig, fieldConfig) => {
  const mockConfigValues = Object.assign(initialValues.config, mockConfig)

  const options = (fieldConfig.multi || fieldConfig.single).split(',')
  const pattern = Patterns[mockConfigValues.patternType].value(options)

  const content = createMockFromConfig(mockConfigValues.blocks, pattern, Defaults)
  return content
}

export const handleMockContent = (mockContent, fieldConfig) => {
  if (Array.isArray(mockContent) && mockContent.length && typeof mockContent[0] === 'object') {
    return mockContent
  }
  const options = (fieldConfig.single || fieldConfig.multi).split(',')
  return [{
    type: options.find(isHeading) || 'paragraph',
    spans: [],
    text: '...',
    ...(typeof mockContent === 'object' ? mockContent : { text: mockContent })
  }]
}