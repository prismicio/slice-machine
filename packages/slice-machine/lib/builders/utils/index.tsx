import { AnyWidget } from '@models/common/widgets/Widget'
import { Media } from "@models/common/widgets/types";

interface Widgets {
  [x: string]: AnyWidget
}

export const findWidgetByConfigOrType = (widgets: Widgets, config: any, type: string) => {
  const isALinkField = type === 'Link';

  if (isALinkField && config?.select === Media.document) {
   return widgets.ContentRelationship
  }

  if (isALinkField && config?.select === Media.media) {
    return widgets.LinkToMedia
  }

  return widgets[type]
}