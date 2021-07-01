import { BooleanField } from './Boolean'
import { Color } from './Color'
import { ContentRelationship } from './ContentRelationship'
import { DateField } from './Date'
import { Embed } from './Embed'
import { GeoPoint } from './GeoPoint'
import { Image } from './Image'
import { Link } from './Link'
import { Number } from './Number'
import { Select } from './Select'
import { StructuredText } from './StructuredText'
import { Text } from './Text'
import { Timestamp } from './Timestamp'
import { UID } from './UID'

export {
  BooleanField as Boolean,
  Color,
  ContentRelationship,
  DateField as Date,
  Embed,
  GeoPoint,
  Image,
  Link,
  Number,
  Select,
  StructuredText,
  Text,
  Timestamp,
  UID,
}


export type FieldWidget =  BooleanField  |
                      Color         |
                      DateField          |
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
                      ContentRelationship
