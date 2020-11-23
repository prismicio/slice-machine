import { MdPlace } from 'react-icons/md'
import { createDefaultWidgetValues, createDefaultHandleMockContentFunction } from '../utils'

/** : {
  "type" : "GeoPoint",
  "config" : {
    "label" : "geopoints"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('GeoPoint')

const createMock = () => ``

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME)

const Meta = {
  icon: MdPlace,
  title: 'GeoPoint',
  description: 'A field for storing geo-coordinates'
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
