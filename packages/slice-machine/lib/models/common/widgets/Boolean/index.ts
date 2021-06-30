import * as yup from 'yup'
import { BsToggleOn } from 'react-icons/bs'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

/** {
    "type" : "Boolean",
    "config" : {
      "placeholder_false" : "false placeholder",
      "placeholder_true" : "true placeholder",
      "default_value" : true,
      "label" : "bool"
    }
  } */

import { removeProp } from '../../../../utils'
import { createInitialValues, createValidationSchema } from '../../../../forms'
import { DefaultFields } from "../../../../forms/defaults"
import { Input, CheckBox } from "../../../../forms/fields"

const TYPE_NAME = 'Boolean'

const Meta = {
  icon: BsToggleOn,
  title: 'Boolean',
  description: 'An input that is either true or false'
}

const FormFields = {
  id: DefaultFields.id,
  label: DefaultFields.label,
  placeholder_false: Input('False Placeholder', { required: false }, null, 'false'),
  placeholder_true: Input('True Placeholder', { required: false }, null, 'true'),
  default_value: CheckBox('Default to true'),
}

const create = () => createInitialValues(FormFields)

const schema = yup.object().shape({
  type: yup.string().matches(/^Boolean$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
})

export const BooleanField = {
  TYPE_NAME,
  handleMockContent,
  handleMockConfig,
  MockConfigForm,
  create,
  Meta,
  schema,
  FormFields
}

export interface BooleanField extends yup.TypeOf<typeof schema> {}