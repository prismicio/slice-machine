import{ BooleanField } from './Boolean'
import{ Color } from './Color'
import{ ContentRelationship } from './ContentRelationship'
import{ DateField } from './Date'
import{ Embed } from './Embed'
import{ GeoPoint } from './GeoPoint'
import{ Image } from './Image'
// import{ Group } from './Group'
import{ Link } from './Link'
import{ Number } from './Number'
import{ Select } from './Select'
import{ StructuredText } from './StructuredText'
import{ Text } from './Text'
import{ Timestamp } from './Timestamp'
import{ UID } from './UID'

// console.log({ StructuredText })
export {
  BooleanField as Boolean,
  Color,
  ContentRelationship,
  DateField as Date,
  Embed,
  GeoPoint,
  Image,
  // Group,
  Link,
  Number,
  Select,
  StructuredText,
  Text,
  Timestamp,
  UID,
}


export type Widget =  BooleanField  |
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
                      // Group             |
                      ContentRelationship
