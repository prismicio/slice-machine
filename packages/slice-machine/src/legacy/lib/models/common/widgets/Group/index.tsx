import { useNestedGroupExperiment } from "@/features/settings/git/useNestedGroupExperiment";
import { Widgets } from "@/legacy/lib/models/common/widgets/groupWidgets";

import { createWidget } from "./createWidget";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GroupListItem = (props: any) => {
  const nestedGroupExperiment = useNestedGroupExperiment();
  const maybeFilteredWidgetsArray = nestedGroupExperiment.eligible
    ? widgetsArray
    : widgetsArray.filter((widget) => widget.CUSTOM_NAME !== "NestedGroup");
  return (
    <CustomListItem
      Widgets={Widgets}
      widgetsArray={maybeFilteredWidgetsArray}
      {...props}
    />
  );
};

export const GroupWidget = createWidget({
  schemaTypeRegex: /^Group$/,
  customListItem: GroupListItem,
});
