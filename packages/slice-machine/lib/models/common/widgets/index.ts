import { BooleanField as BooleanFieldType } from './Boolean'
import { Color as ColorType } from './Color'
import { ContentRelationship as ContentRelationshipType } from './ContentRelationship'
import { Date as DateType } from './Date'
import { Embed } from './Embed'
import { GeoPoint } from './GeoPoint'
import { Image } from './Image'
import { Group } from './Group'
import { Link } from './Link'
import { Number } from './Number'
import { Select } from './Select'
import { StructuredText } from './StructuredText'
import { Text } from './Text'
import { Timestamp } from './Timestamp'
import { UID } from './UID'

export { default as Boolean } from './Boolean'
export { default as Color } from './Color'
export { default as ContentRelationship } from './ContentRelationship'
export { default as Date } from './Date'
export { default as Embed } from './Embed'
export { default as GeoPoint } from './GeoPoint'
export { default as Image } from './Image'
export { default as Group } from './Group'
export { default as Link } from './Link'
export { default as Number } from './Number'
export { default as Select } from './Select'
export { default as StructuredText } from './StructuredText'
export { default as Text } from './Text'
export { default as Timestamp } from './Timestamp'
export { default as UID } from './UID'


export type Widget =  BooleanFieldType  |
                      ColorType         |
                      DateType          |
                      Embed             |
                      GeoPoint          |
                      Image             |
                      Link              |
                      Number            |
                      Select            |
                      StructuredText    |
                      Text              |
                      Timestamp         |
                      UID               |
                      Group             |
                      ContentRelationshipType
