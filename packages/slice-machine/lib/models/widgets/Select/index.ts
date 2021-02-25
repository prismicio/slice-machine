import * as yup from 'yup'
import { MdDns } from 'react-icons/md'

import {
  createInitialValues,
  createValidationSchema
} from 'lib/forms'

import { removeProp } from 'lib/utils'

import FormFields from './FormFields'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

/**
 * {
      "type" : "Select",
      "config" : {
        "label" : "Image side",
        "default_value" : "left",
        "options" : [ "left", "right" ]
      }
    }
*/

const TYPE_NAME = 'Select'

const create = (apiId: string) => ({
  ...createInitialValues(FormFields),
  id: apiId
})

const Meta = {
  icon: MdDns,
  title: 'Select',
  description: 'A rich text field with formatting options'
}

const schema = yup.object().shape({
  type: yup.string().matches(/^Select$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
})

export default {
  FormFields,
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  create,
  schema,
  Meta,
  TYPE_NAME
}

export interface Select extends yup.TypeOf<typeof schema> {}