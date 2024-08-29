import { type DroppableStateSnapshot } from "react-beautiful-dnd";

import { useNestedGroupExperiment } from "@/features/builder/useNestedGroupExperiment";
import { type Item } from "@/legacy/components/ListItem";
import { type TabField } from "@/legacy/lib/models/common/CustomType";
import { type GroupSM } from "@/legacy/lib/models/common/Group";
import { Widgets } from "@/legacy/lib/models/common/widgets/groupWidgets";
import { type Widget } from "@/legacy/lib/models/common/widgets/Widget";

import { createGroupWidget, type SchemaType } from "./createGroupWidget";
import { CustomListItem } from "./ListItem";

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
  Widgets.NestedGroup,
];

export interface GroupListItemProps<F extends TabField> {
  tabId: string;
  widget: Widget<F, SchemaType>;
  parentSnapshot: DroppableStateSnapshot;
  showHints: boolean;
  isRepeatable: boolean;
  item: Item<F>;
  draggableId: string;
  saveItem: ({
    apiId,
    newKey,
    value,
    isNewGroupField,
  }: {
    apiId: string;
    newKey: string;
    value: F;
    isNewGroupField?: boolean;
  }) => void;
  HintElement: JSX.Element;
}

const hintItemName = "item";

const GroupListItem = (props: GroupListItemProps<GroupSM>): JSX.Element => {
  const nestedGroupExperiment = useNestedGroupExperiment();
  const maybeFilteredWidgetsArray = nestedGroupExperiment.eligible
    ? widgetsArray
    : widgetsArray.filter((widget) => widget.CUSTOM_NAME !== "NestedGroup");
  return (
    <CustomListItem
      Widgets={Widgets}
      widgetsArray={maybeFilteredWidgetsArray}
      hintBase={hintItemName}
      {...props}
    />
  );
};

export const GroupWidget = createGroupWidget({
  schemaTypeRegex: /^Group$/,
  customListItem: GroupListItem,
  hintItemName,
});
