import { useTableFieldExperiment } from "@/features/builder/useTableFieldExperiment";
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
  Widgets.Table,
  Widgets.Embed,
  Widgets.Timestamp,
  Widgets.GeoPoint,
  Widgets.ContentRelationship,
  Widgets.LinkToMedia,
];

const hintItemName = "subItem";

const NestedGroupListItem = (props: GroupListItemProps<NestedGroupSM>) => {
  const tableFieldExperiment = useTableFieldExperiment();
  const maybeFilteredWidgetsArray = tableFieldExperiment.eligible
    ? widgetsArray
    : widgetsArray.filter((widget) => widget.TYPE_NAME !== "Table");

  return (
    <CustomListItem
      Widgets={Widgets}
      widgetsArray={maybeFilteredWidgetsArray}
      hintBase={hintItemName}
      {...props}
    />
  );
};

export const NestedGroupWidget = createGroupWidget({
  schemaTypeRegex: /^NestedGroup$/,
  customListItem: NestedGroupListItem,
  customName: "NestedGroup",
  hintItemName,
});
