import type { TypeOf } from 'yup'
import { MdColorLens } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockContent, handleMockConfig } from './Mock'
import { MockConfigForm } from './Mock/Form'

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

export default {
  handleMockContent,
  handleMockConfig,
  create,
  MockConfigForm,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}

export interface Color extends TypeOf<typeof schema> {}