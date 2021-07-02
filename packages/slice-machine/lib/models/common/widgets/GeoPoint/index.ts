import { MdPlace } from 'react-icons/md'
import { createDefaultWidgetValues } from '../../../../utils'
import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget } from '../Widget'
import { GeoPointField } from '../types'
import { FieldType } from '../../CustomType/fields'

/** : {
  "type" : "GeoPoint",
  "config" : {
    "label" : "geopoints"
  }
} */

const { FormFields, schema } = createDefaultWidgetValues(FieldType.GeoPoint)

const Meta = {
  icon: MdPlace,
  title: 'GeoPoint',
  description: 'A field for storing geo-coordinates'
}

export const GeoPoint: Widget<GeoPointField, typeof schema> = {
  create: () => new GeoPointField(),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  FormFields,
  TYPE_NAME: FieldType.GeoPoint,
  schema,
  Meta
}
