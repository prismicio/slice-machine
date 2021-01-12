import * as yup from 'yup'
import Form, { FormFields } from './Form'

import { optionValues } from './options'
import { MdTextFields } from 'react-icons/md'

import { handleMockConfig, handleMockContent, createMock } from './Mock'
import { MockConfigForm, MockContentForm } from './Mock/Forms'

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

const TYPE_NAME = 'StructuredText'

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
  handleMockConfig,
  handleMockContent,
  FormFields,
  Meta,
  schema,
  TYPE_NAME,
  Form,
  MockConfigForm,
  MockContentForm
}