import * as t from 'io-ts'

import Color from './Color'
import BooleanField from './BooleanField'
import Date from './Date'
import Embed from './Embed'
import GeoPoint from './GeoPoint'
import Number from './Number'
import Range from './Range'
import RichText from './RichText'
import Select from './Select'
import Separator from './Separator'
import Text from './Text'
import Timestamp from './Timestamp'
import Link from './Link'
import Image from './Image'
import IntegrationField from './IntegrationField'

const NestableWidget = t.union([
  Color,
  BooleanField,
  Embed,
  GeoPoint,
  Date,
  Number,
  Range,
  RichText,
  Select,
  Separator,
  Text,
  Timestamp,
  Link,
  Image,
  IntegrationField
])

type NestableWidget = t.TypeOf<typeof NestableWidget>

export default NestableWidget