export enum Actions {
  RemoveWidget = 'variation-remove-widget'
}

export interface Variation {
  id: string
  name: string
  description: string
  imageUrl: string
  docURL: string
  version: string
  display?: string
  primary?: any[]
  items?: any[]
}

export const Variation = {
  getArea(variation: Variation, area: VariationArea): any[] | null | undefined {
    switch(area) {
      case VariationArea.Primary: return variation.primary
      case VariationArea.Items: return variation.items
      default: null
    }
  }
}

type State = { variations: ReadonlyArray<Variation> }

enum VariationArea {
  Primary = 'primary',
  Items = 'items'
}

export function removeWidget(state: State, { id, modelFieldName, key }: { id: string, modelFieldName: VariationArea, key: string}): State {
  return {
    ...state,
    variations: state.variations.map(variation => {
      if (variation.id === id) {
        return {
          ...variation,
          [modelFieldName]: Variation.getArea(variation, modelFieldName)?.filter(e => e.key !== key)
        }
      }
      return variation
    })
  }
}