import { UID } from "@prismicio/types-internal/lib/customtypes/widgets";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { GroupSM } from "@slicemachine/core/build/src/models/Group";

interface Widgets {
  [x: string]: NestableWidget | UID | GroupSM;
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
