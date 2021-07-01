import { MdDateRange } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { SimpleWidget, Widget, WidgetType } from '../Widget'

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

export const DateField = {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}

export interface DateField extends Widget<FieldType.Date, SimpleWidget> {}