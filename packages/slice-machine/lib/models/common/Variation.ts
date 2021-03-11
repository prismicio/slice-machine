import { Widget } from './widgets'

export enum WidgetsArea {
  Primary = 'primary',
  Items = 'items'
}

export interface Variation<F extends AsArray | AsObject> {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly imageUrl: string
    readonly docURL: string
    readonly version: string
    readonly display?: string
    readonly primary: F
    readonly items: F
}

export type AsArray = ReadonlyArray<{key: string, value: Widget}>
export type AsObject = { [key: string]: Widget }


export const Variation = {
  toObject(variation: Variation<AsArray>): Variation<AsObject> {
    return {
      ...variation,
      primary: variation.primary.reduce((acc, {key, value}) => ( { ...acc, [key]: value } ), {}),
      items: variation.items.reduce((acc, {key, value}) => ( { ...acc, [key]: value } ), {})
    }
  },

  toArray(variation: Variation<AsObject>): Variation<AsArray> {
    return {
      ...variation,
      primary: Object.entries(variation.primary).map(([key, value]) => ({ key, value })),
      items: Object.entries(variation.items).map(([key, value]) => ({ key, value }))
    }
  },

  getWidgetArea<F extends AsArray | AsObject>(variation: Variation<F>, area: WidgetsArea): F | undefined {
    switch(area) {
      case WidgetsArea.Primary: return variation.primary
      case WidgetsArea.Items: return variation.items
      default: return
    }
  }
}
