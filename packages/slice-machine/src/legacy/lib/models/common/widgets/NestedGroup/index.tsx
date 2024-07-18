import { type NestedGroupSM } from "@/legacy/lib/models/common/Group";
import { type GroupListItemProps } from "@/legacy/lib/models/common/widgets/Group";
import { createGroupWidget } from "@/legacy/lib/models/common/widgets/Group/createGroupWidget";
import { CustomListItem } from "@/legacy/lib/models/common/widgets/Group/ListItem";
import { NonGroupWidgets as Widgets } from "@/legacy/lib/models/common/widgets/nonGroupWidgets";

const widgetsArray = [
  Widgets.Image,
  Widgets.Text,
  Widgets.StructuredText,
  Widgets.Link,
  Widgets.Select,
  Widgets.Boolean,
  Widgets.Number,
  Widgets.Color,
  Widgets.Date,
  Widgets.Embed,
  Widgets.Timestamp,
  Widgets.GeoPoint,
  Widgets.ContentRelationship,
  Widgets.LinkToMedia,
];

const hintItemName = "subItem";

const NestedGroupListItem = (props: GroupListItemProps<NestedGroupSM>) => (
  <CustomListItem
    Widgets={Widgets}
    widgetsArray={widgetsArray}
    hintBase={hintItemName}
    {...props}
  />
);

export const NestedGroupWidget = createGroupWidget({
  schemaTypeRegex: /^NestedGroup$/,
  customListItem: NestedGroupListItem,
  customName: "NestedGroup",
  hintItemName,
});
