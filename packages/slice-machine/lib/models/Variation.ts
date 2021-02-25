import { Widget } from './widgets'

export enum WidgetsArea {
  Primary = 'primary',
  Items = 'items'
}

interface Variation {
  id: string
  name: string
  description: string
  imageUrl: string
  docURL: string
  version: string
  display?: string
}

export interface VariationAsObj extends Variation {
  primary?: { [key: string]: Widget }
  items?: { [key: string]: Widget }
}

export interface VariationAsArr extends Variation {
  primary?: ReadonlyArray<Widget>
  items?: ReadonlyArray<Widget>
}

export const VariationAsArr = {
  getWidgetArea(variation: VariationAsArr, area: WidgetsArea): ReadonlyArray<Widget> | undefined {
    switch(area) {
      case WidgetsArea.Primary: return variation.primary
      case WidgetsArea.Items: return variation.items
      default: return
    }
  }
}
