import * as Widgets from "./withGroup";

const ctBuilderArray = [
  Widgets.UID,
  Widgets.Group,
  Widgets.StructuredText,
  Widgets.Image,
  Widgets.Link,
  Widgets.LinkToMedia,
  Widgets.ContentRelationship,
  Widgets.Select,
  Widgets.Boolean,
  Widgets.Date,
  Widgets.Timestamp,
  Widgets.Embed,
  Widgets.Number,
  Widgets.GeoPoint,
  Widgets.Color,
  Widgets.Text,
];

export default ctBuilderArray;

export type CtBuilderArrayTypes = typeof ctBuilderArray;
