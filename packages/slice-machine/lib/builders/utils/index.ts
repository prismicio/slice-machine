import { TabField } from "@lib/models/common/CustomType";

interface Widgets {
  [x: string]: TabField;
}

export const findWidgetByConfigOrType = (
  widgets: Widgets,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  type: string
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

  return widgets[type];
};
