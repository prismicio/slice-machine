import { FiCode } from 'react-icons/fi'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { SimpleWidget, Widget, WidgetType } from '../Widget'

/**  {
  "type" : "Embed",
  "config" : {
    "label" : "embed",
    "placeholder" : "dddd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Embed')

const Meta = {
  icon: FiCode,
  title: 'Embed',
  description: 'Embed videos, songs, tweets, slides, …'
}

export const Embed = {
  create,
  handleMockConfig,
  MockConfigForm,
  handleMockContent,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}

export interface Embed extends Widget<FieldType.Embed, SimpleWidget> {}