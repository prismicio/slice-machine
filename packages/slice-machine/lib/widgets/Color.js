import { createDefaultWidgetValues } from '../utils'

/** {
  "type" : "Color",
  "config" : {
    "label" : "color"
  }
} */



const Meta = {
  title: 'Color',
  description: '...'
}

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Color')

const createMock = (maybeMock) => maybeMock || `#${Math.floor(Math.random()*16777215).toString(16)}`

export default {
  createMock,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}
