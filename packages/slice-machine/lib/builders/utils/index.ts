import { AnyWidget } from '@lib/models/common/widgets/Widget'
import { Media } from "@lib/models/common/widgets/Link/type" ;

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