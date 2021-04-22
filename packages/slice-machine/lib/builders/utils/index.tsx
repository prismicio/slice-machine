import { Widget } from '../../models/common/widgets'

interface Widgets {
  [x: string]: Widget
}

export const findWidgetByConfigOrType = (widgets: Widgets, config: any, type: string) => {
  if (type === 'Link') {
    return config?.select === 'document' ? widgets.ContentRelationship : widgets.Link
  }
  return widgets[type]
}