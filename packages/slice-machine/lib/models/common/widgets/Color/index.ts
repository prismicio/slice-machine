import { MdColorLens } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockContent, handleMockConfig } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget } from '../Widget'

import { FieldType, SimpleField } from '../../CustomType/fields'
import { ColorField } from '../types'

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

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues(FieldType.Color)

export const Color: Widget<ColorField, typeof schema> = {
  handleMockContent,
  handleMockConfig,
  create,
  MockConfigForm,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}
