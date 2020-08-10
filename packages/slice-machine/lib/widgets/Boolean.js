/** {
    "type" : "Boolean",
    "config" : {
      "placeholder_false" : "false placeholder",
      "placeholder_true" : "true placeholder",
      "default_value" : true,
      "label" : "bool"
    }
  } */

import { createInitialValues } from '../forms'
import { DefaultFields } from "../forms/defaults"
import { Input, CheckBox } from "../forms/fields"

const createMock = (maybeMock) => maybeMock || Math.random() < 0.50 ? true : false

const Meta = {
  title: 'Boolean',
  description: 'An input that is either true or false'
}

const FormFields = {
  ...DefaultFields,
  placeholder_false: Input('False Placeholder', { required: false }, null, 'false'),
  placeholder_true: Input('True Placeholder', { required: false }, null, 'true'),
  default_value: CheckBox('Default to true'),
}

const create = (apiId) => ({
  ...createInitialValues(FormFields),
  id: apiId
})

export default {
  createMock,
  create,
  Meta,
  FormFields
}