import { FiCode } from 'react-icons/fi'
import { createDefaultWidgetValues } from '../utils'

/**  {
  "type" : "Embed",
  "config" : {
    "label" : "embed",
    "placeholder" : "dddd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Embed')

const createMock = (maybeMock) => maybeMock || ``

const Meta = {
  icon: FiCode,
  title: 'Embed',
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