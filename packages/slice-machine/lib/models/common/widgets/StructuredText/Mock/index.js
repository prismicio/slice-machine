import faker from 'faker'
import { LoremIpsum } from 'lorem-ipsum'
import { handleMockConfig as generateImageMock } from '../../Image/Mock'

const isHeading = (type) => type.indexOf('heading') === 0

export const DEFAULT_PATTERN_KEY = 'PARAGRAPH'

export const LoremDefaultConfig = {
  sentencesPerParagraph: {
    min: 1,
    max: 3,
  },
  wordsPerSentence: {
    min: 4,
    max: 16,
  }
}

const optionalType = (options, type) =>
  options.find(e => e === type) && Math.random() > .5 ? [type] : []

export const Patterns = {
  PARAGRAPH: {
    title: 'Simple Paragraph',
    test: (options) => options.some(e => e === 'paragraph'),
    value: () => ['paragraph'],
    description: 'A single paragraph with a variant number of words.'
  },
  HEADING: {
    title: 'Section Title',
    test: (options) => options.some(isHeading),
    value: (options) => [options.find(isHeading) || 'heading1'],
    description: 'A single heading (h1 to h6) with a variant number of words.'
  },
  STORY: {
    title: 'Story',
    test: (options) => options.some(isHeading) && options.some(e => e === 'paragraph'),
    value: (options) => [options.find(isHeading) || 'heading1', ...optionalType(options, 'image'), 'paragraph'],
    description: 'Content with headings, texts and optional images'
  }
}

const findMatchingPattern = (options) => {
  const PatternEntry = Object.entries(Patterns).find(([key, patt]) => patt.test(options))
  if (PatternEntry && PatternEntry.length) {
    return PatternEntry[1]
  }
  return Patterns[DEFAULT_PATTERN_KEY]
}

const isTextType = (type) => type === 'paragraph' || isHeading(type)
const handleText = (contentType, loremConfig) => {
  const lorem = new LoremIpsum(loremConfig)
  if (isHeading(contentType)) {
    const fake = faker.company.bs()
    return [fake[0].toUpperCase(), ...fake.slice(1)].join('')
  }
  return lorem.generateParagraphs(1)
}

const createMockFromConfig = (blocksLen, pattern, loremConfig) => {
  const content = Array(blocksLen).fill().map(() => {
    return pattern.map(contentType => {
      if (isTextType(contentType)) {
        return {
          type: contentType,
          text: handleText(contentType, loremConfig),
          spans: []
        }
      }
      if (contentType === 'image') {
        const res = generateImageMock(null, {})
        return {
          type: contentType,
          ...res
        }
      }
    })
  })
  return content.flat()
}

export const handleMockConfig = (mockConfigValues, fieldConfig) => {
  const options = (fieldConfig.multi || fieldConfig.single).split(',')
  const patternType = mockConfigValues ? mockConfigValues.patternType : null
  const patternObj = Patterns[patternType] || findMatchingPattern(options)

  const pattern = patternObj.value(options)
  return createMockFromConfig(mockConfigValues.blocks, pattern, LoremDefaultConfig)
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

export const initialValues = {
  config: {
    patternType: DEFAULT_PATTERN_KEY,
    blocks: 1
  }
}