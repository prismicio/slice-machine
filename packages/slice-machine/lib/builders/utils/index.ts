import { TabField } from "@lib/models/common/CustomType";
import type * as Widgets from "@lib/models/common/widgets/withGroup";

type Widgets = Partial<typeof Widgets>;

export const findWidgetByConfigOrType = (widgets: Widgets, field: TabField) => {
  switch (field.type) {
    case "Link": {
      switch (field.config?.select) {
        case "document":
          return widgets.ContentRelationship;
        case "media":
          return widgets.LinkToMedia;
        default:
          return widgets.Link;
      }
    }

    case "Group": {
      return field.config?.repeat === false
        ? widgets.Group
        : widgets.RepeatableGroup;
    }
  }

  return widgets[field.type as keyof typeof widgets];
};
