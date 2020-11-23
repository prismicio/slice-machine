import { AiOutlineFieldNumber } from 'react-icons/ai'
import { createDefaultWidgetValues, createDefaultHandleMockContentFunction } from '../utils'

/** {
    "type" : "Number",
    "config" : {
      "label" : "number",
      "placeholder" : "Some number"
    }
  } */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Number')

const createMock = () => Math.floor(Math.random() * 9999)

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME, 'number')

const Meta = {
  icon: AiOutlineFieldNumber,
  title: 'Number',
  description: 'Numbers'
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
