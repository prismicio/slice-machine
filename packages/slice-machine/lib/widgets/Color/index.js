import { MdColorLens } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../utils'
import { createMock, handleMockContent } from './mock'

/** {
  "type" : "Color",
  "config" : {
    "label" : "color"
  }
} */

const Meta = {
  icon: MdColorLens,
  title: 'Color',
  description: 'A color picker'
}

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Color')

export default {
  createMock,
  handleMockContent,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}
