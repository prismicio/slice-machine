import { MdColorLens } from 'react-icons/md'
import { createDefaultWidgetValues, createDefaultHandleMockContentFunction } from '../utils'

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

const createMock = () => `#${Math.floor(Math.random()*16777215).toString(16)}`

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME)

export default {
  createMock,
  handleMockContent,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}
