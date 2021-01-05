import { MdDateRange } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../utils'
import { createMock, handleMockContent } from './mock'

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Date')

const Meta = {
  icon: MdDateRange,
  title: 'Date',
  description: 'A calendar date picker'
}

export default {
  createMock,
  handleMockContent,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}