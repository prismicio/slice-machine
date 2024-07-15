import { GroupFieldType } from "@prismicio/types-internal/lib/customtypes/widgets";

import { TabField } from "@/legacy/lib/models/common/CustomType";

interface Widgets {
  [x: string]: TabField;
}

export const findWidgetByConfigOrType = (
  widgets: Widgets,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  type: string,
) => {
  if (type === "Link") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (config?.select) {
      case "document":
        return widgets.ContentRelationship;
      case "media":
        return widgets.LinkToMedia;
      default:
        return widgets.Link;
    }
  }
  // The Group & NestedGroup widgets share the "Group" type. They are never
  // in the same widget group, so this will use whichever is provided. For example,
  // in the custom list item for Group, we always pass NestedGroup as the Group widget.
  if (type === GroupFieldType) {
    return widgets.Group ?? widgets.NestedGroup;
  }

  return widgets[type];
};
