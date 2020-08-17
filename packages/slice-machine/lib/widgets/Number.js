import { createDefaultWidgetValues } from '../utils'

/** {
    "type" : "Number",
    "config" : {
      "label" : "number",
      "placeholder" : "Some number"
    }
  } */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Number')

const createMock = (maybeMock) => maybeMock || Math.floor(Math.random() * 9999)

const Meta = {
  title: 'Number',
  description: '...'
}

export default {
  createMock,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}
