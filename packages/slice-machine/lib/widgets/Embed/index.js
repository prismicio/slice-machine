import { FiCode } from 'react-icons/fi'
import { createDefaultWidgetValues } from '../../utils'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

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

export default {
  create,
  handleMockConfig,
  MockConfigForm,
  handleMockContent,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}