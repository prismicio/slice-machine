import { AnyWidget } from "../../models/common/widgets/Widget";

interface Widgets {
  [x: string]: AnyWidget;
}

export const findWidgetByConfigOrType = (
  widgets: Widgets,
  config: any,
  type: string
) => {
  if (type === "Link") {
    return config?.select === "document"
      ? widgets.ContentRelationship
      : widgets.Link;
  }
  return widgets[type];
};
