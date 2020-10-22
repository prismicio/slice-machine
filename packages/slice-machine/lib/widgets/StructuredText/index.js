import * as yup from 'yup'
import Form, { FormFields } from './Form'
import { optionValues } from './options'
import { MdTextFields } from 'react-icons/md'
import { LoremIpsum } from "lorem-ipsum"
import faker from 'faker'

import {
  createInitialValues,
  createValidationSchema
} from 'lib/forms'

import { removeProp } from '../../utils'

/**
 * {
    "type": "StructuredText",
    "config": {
      "label": "Title",
      "single": "heading1, heading2, heading3, heading4, heading5, heading6"
    }
  }
*/

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 3,
    min: 1
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

const TYPE_NAME = 'StructuredText'

const isHeading = (type) => type.indexOf('heading') === 0

const _createMock = (config) => {
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

  return [{
    type: mainType,
    text: isHeading ? faker.company.bs() :  lorem.generateParagraphs(Math.floor(Math.random() * 3) + 1),
    spans: []
  }]
}

const fromUser = (mock) => {
  return typeof mock === 'object' ? mock : [{
    type: 'paragraph',
    text: mock,
    spans: []
  }]
}

const createMock = (maybeMock, config) => maybeMock
  ? fromUser(maybeMock)
  : _createMock(config)

const Meta = {
  icon: MdTextFields,
  title: 'Rich Text',
  description: 'A rich text field with formatting options'
}

const create = (apiId) => ({
  ...createInitialValues(FormFields),
  single: optionValues.join(','),
  id: apiId
})

const schema = yup.object().shape({
  type: yup.string().matches(/^StructuredText$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
})

export default {
  create,
  createMock,
  FormFields,
  Meta,
  schema,
  TYPE_NAME,
  Form
}