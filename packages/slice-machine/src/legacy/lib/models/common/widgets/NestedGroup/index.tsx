import { createWidget } from "@/legacy/lib/models/common/widgets/Group/createWidget";
import { CustomListItem } from "@/legacy/lib/models/common/widgets/Group/ListItem";
import { NonGroupWidgets as Widgets } from "@/legacy/lib/models/common/widgets/nonGroupWidgets";

const widgetsArray = [
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
const NestedGroupListItem = (props: any) => (
  <CustomListItem Widgets={Widgets} widgetsArray={widgetsArray} {...props} />
);

export const NestedGroupWidget = createWidget({
  schemaTypeRegex: /^NestedGroup$/,
  customListItem: NestedGroupListItem,
  customName: "NestedGroup",
});
