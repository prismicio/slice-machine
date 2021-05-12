const  BooleanField = require('./Boolean').BooleanField
const  Color = require('./Color').Color
const  ContentRelationship = require('./ContentRelationship').ContentRelationship
const  DateField = require('./Date').DateField
const  Embed = require('./Embed').Embed
const  GeoPoint = require('./GeoPoint').GeoPoint
const  Image = require('./Image').Image
const  Group = require('./Group').Group
const  Link = require('./Link').Link
const  Number = require('./Number').Number
const  Select = require('./Select').Select
const  StructuredText = require('./StructuredText').StructuredText
const  Text = require('./Text').Text
const  Timestamp = require('./Timestamp').Timestamp
const  UID = require('./UID').UID

// console.log({ StructuredText })
export {
  BooleanField as Boolean,
  Color,
  ContentRelationship,
  DateField as Date,
  Embed,
  GeoPoint,
  Image,
  Group,
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
                      Group             |
                      ContentRelationship
