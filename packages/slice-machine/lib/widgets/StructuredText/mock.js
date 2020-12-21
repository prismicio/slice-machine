import faker from 'faker'
import { LoremIpsum } from "lorem-ipsum"

const defaults = {
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

const isHeading = (type) => type.indexOf('heading') === 0

const patterns = {
  PARAGRAPH: () => ['paragraph'],
  HEADING: (options) => [options.find(isHeading) || 'heading2'],
  PARAGRAPH_WITH_HEADING: (options) => [options.find(isHeading) || 'heading2', 'paragraph'],
  _: (options) => [options.find(isHeading) || 'paragraph']
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
  const { blocks, ...config } = Object.assign(defaults, mockConfig)
  const blocksLen = fieldConfig.multi
    ? Math.floor(Math.random() * (blocks.max - blocks.min + 1)) + blocks.min
    : 1
  const options = (fieldConfig.multi || fieldConfig.single).split(',')
  const pattern = mockConfig.pattern
    || patterns[mockConfig.patternType]
    ? patterns[mockConfig.patternType](options)
    : patterns._(options)

  const content = createMockFromConfig(blocksLen, pattern, config)
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

/** Deprecate this at some point */
export const createMock = (config) => {
  const field = config.single || config.multi || 'paragraph'
  const mainType = (() => {
    const split = field.split(',')
    if (split.length === 1) {
      return split[0]
    }
    const maybeHeading = split.find(e => e.indexOf('heading') === 0)
    if (maybeHeading) {
      return maybeHeading
    }
    return 'paragraph'
  })()

  const lorem = new LoremIpsum(defaults)

  return [{
    type: mainType,
    text: isHeading(field) ? faker.company.bs() :  lorem.generateParagraphs(Math.floor(Math.random() * 3) + 1),
    spans: []
  }]
}