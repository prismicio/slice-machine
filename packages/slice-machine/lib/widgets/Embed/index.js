import { FiCode } from 'react-icons/fi'
import { createDefaultWidgetValues } from '../../utils'
import { createMock, handleMockContent } from './mock'

/**  {
  "type" : "Embed",
  "config" : {
    "label" : "embed",
    "placeholder" : "dddd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Embed')

const Meta = {
  icon: FiCode,
  title: 'Embed',
  description: 'Embed videos, songs, tweets, slides, …'
}

export default {
  createMock,
  create,
  handleMockContent,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}