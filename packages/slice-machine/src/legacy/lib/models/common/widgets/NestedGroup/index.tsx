import { type NestedGroupSM } from "@/legacy/lib/models/common/Group";
import { type GroupListItemProps } from "@/legacy/lib/models/common/widgets/Group";
import { createGroupWidget } from "@/legacy/lib/models/common/widgets/Group/createGroupWidget";
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
