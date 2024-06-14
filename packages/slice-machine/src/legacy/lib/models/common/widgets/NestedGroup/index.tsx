import { type NestedGroupSM } from "@/legacy/lib/models/common/Group";
import { type GroupListItemProps } from "@/legacy/lib/models/common/widgets/Group";
import { createWidget } from "@/legacy/lib/models/common/widgets/Group/createWidget";
import { CustomListItem } from "@/legacy/lib/models/common/widgets/Group/ListItem";
import { NonGroupWidgets as Widgets } from "@/legacy/lib/models/common/widgets/nonGroupWidgets";

export const customName = "NestedGroup";

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

const NestedGroupListItem = (props: GroupListItemProps<NestedGroupSM>) => (
  <CustomListItem
    Widgets={Widgets}
    widgetsArray={widgetsArray}
    isNestedGroupItem
    {...props}
  />
);

export const NestedGroupWidget = createWidget({
  schemaTypeRegex: /^NestedGroup$/,
  customListItem: NestedGroupListItem,
  customName,
});
