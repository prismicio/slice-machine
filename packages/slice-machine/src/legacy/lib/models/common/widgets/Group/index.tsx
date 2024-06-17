import { type DroppableStateSnapshot } from "react-beautiful-dnd";

import { useNestedGroupExperiment } from "@/hooks/useNestedGroupExperiment";
import { type Item } from "@/legacy/components/ListItem";
import { type TabField } from "@/legacy/lib/models/common/CustomType";
import { type GroupSM } from "@/legacy/lib/models/common/Group";
import { Widgets } from "@/legacy/lib/models/common/widgets/groupWidgets";
import { type Widget } from "@/legacy/lib/models/common/widgets/Widget";

import { createGroupWidget, type SchemaType } from "./createGroupWidget";
import { CustomListItem } from "./ListItem";

const widgetsArray = [
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
  }: {
    apiId: string;
    newKey: string;
    value: F;
  }) => void;
  HintElement: JSX.Element;
}

const subItemHintBase = "item";

const GroupListItem = (props: GroupListItemProps<GroupSM>): JSX.Element => {
  const nestedGroupExperiment = useNestedGroupExperiment();
  const maybeFilteredWidgetsArray = nestedGroupExperiment.eligible
    ? widgetsArray
    : widgetsArray.filter((widget) => widget.CUSTOM_NAME !== "NestedGroup");
  return (
    <CustomListItem
      Widgets={Widgets}
      widgetsArray={maybeFilteredWidgetsArray}
      hintBase={subItemHintBase}
      {...props}
    />
  );
};

export const GroupWidget = createGroupWidget({
  schemaTypeRegex: /^Group$/,
  customListItem: GroupListItem,
  subItemHintBase,
});
