import { AnyWidget } from '@models/common/widgets/Widget'
import { Media } from "@models/common/widgets/types";

interface Widgets {
  [x: string]: AnyWidget
}

export const findWidgetByConfigOrType = (widgets: Widgets, config: any, type: string) => {
  if (type === 'Link') {
    switch(config?.select) {
      case Media.document: return widgets.ContentRelationship
      case Media.media: return widgets.LinkToMedia
      default: return widgets.Link
    }
  }

  return widgets[type]
}