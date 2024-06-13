import { Widgets } from "@/legacy/lib/models/common/widgets/groupWidgets";

import { createWidget } from "./createWidget";
import { CustomListItem } from "./ListItem";

export const widgetsArray = [
  Widgets.NestedGroup,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GroupListItem = (props: any) => (
  <CustomListItem Widgets={Widgets} widgetsArray={widgetsArray} {...props} />
);

export const GroupWidget = createWidget({
  schemaTypeRegex: /^Group$/,
  customListItem: GroupListItem,
});
