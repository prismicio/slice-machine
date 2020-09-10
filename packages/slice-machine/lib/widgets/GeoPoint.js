import { MdPlace } from 'react-icons/md'
import { createDefaultWidgetValues } from '../utils'

/** : {
  "type" : "GeoPoint",
  "config" : {
    "label" : "geopoints"
  }
} */

const { TYPE_NAME, FormFields, schema, create } = createDefaultWidgetValues('GeoPoint')

const createMock = (maybeMock) => maybeMock || ``

const Meta = {
  icon: MdPlace,
  title: 'GeoPoint',
  description: 'A field for storing geo-coordinates'
}

export default {
  createMock,
  create,
  FormFields,
  TYPE_NAME,
  schema,
  Meta
}
