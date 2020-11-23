import { MdDateRange } from 'react-icons/md'
import Timestamp from './Timestamp'
import { createDefaultWidgetValues, createDefaultHandleMockContentFunction } from '../utils'

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Date')

const createMock = () => Timestamp.createMock().toISOString().split('T')[0]

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME)

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