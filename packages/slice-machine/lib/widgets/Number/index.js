import { AiOutlineFieldNumber } from 'react-icons/ai'
import { createDefaultWidgetValues } from '../../utils'
import { createMock, handleMockContent } from './mock'

/** {
    "type" : "Number",
    "config" : {
      "label" : "number",
      "placeholder" : "Some number"
    }
  } */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Number')

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
