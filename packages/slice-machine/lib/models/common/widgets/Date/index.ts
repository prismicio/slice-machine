import { MdDateRange } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget } from '../Widget'
import { DateField } from '../types'
import { FieldType } from '../../CustomType/fields'

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

const { FormFields, schema } = createDefaultWidgetValues(FieldType.Date)

const Meta = {
  icon: MdDateRange,
  title: 'Date',
  description: 'A calendar date picker'
}

export const DateWidget: Widget<DateField, typeof schema> = {
  create: () => new DateField(),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  FormFields,
  TYPE_NAME: FieldType.Date,
  schema,
  Meta
}
