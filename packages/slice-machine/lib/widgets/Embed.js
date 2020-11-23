import { FiCode } from 'react-icons/fi'
import { createDefaultWidgetValues, createDefaultHandleMockContentFunction } from '../utils'

/**  {
  "type" : "Embed",
  "config" : {
    "label" : "embed",
    "placeholder" : "dddd"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('Embed')

const createMock = () => `https://www.youtube.com/watch?v=7SgFFT1Bv78&ab_channel=Prismic`

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME)

const Meta = {
  icon: FiCode,
  title: 'Embed',
  description: 'Embed videos, songs, tweets, slides, …'
}

export default {
  createMock,
  create,
  handleMockContent,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}