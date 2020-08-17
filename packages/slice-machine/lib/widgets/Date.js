import Timestamp from './Timestamp'
import { createDefaultWidgetValues } from '../utils'

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Date')

const createMock = (maybeMock) => maybeMock || Timestamp.createMock().toISOString().split('T')[0]

const Meta = {
  title: 'Date',
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