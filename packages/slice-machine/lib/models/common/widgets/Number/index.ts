import { AiOutlineFieldNumber } from 'react-icons/ai'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget, WidgetType, SimpleWidget } from '../Widget'

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

export const Number = {
  create,
  MockConfigForm,
  handleMockConfig,
  handleMockContent,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}

export interface Number extends Widget<FieldType.Number, SimpleWidget> {}
