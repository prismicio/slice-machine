import * as yup from 'yup'
import Form, { FormFields } from './Form'

import { optionValues } from './options'
import { MdTextFields } from 'react-icons/md'

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import {
  createInitialValues,
  createValidationSchema
} from '../../../forms'

import { removeProp } from '../../../utils'

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

const create = (apiId: string) => ({
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
  handleMockConfig,
  handleMockContent,
  FormFields,
  Meta,
  schema,
  TYPE_NAME,
  Form,
  MockConfigForm,
}

export interface StructuredText extends yup.TypeOf<typeof schema> {}