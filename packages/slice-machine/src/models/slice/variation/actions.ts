import { Variation, WidgetsArea } from "lib/models/common/Variation"
import SliceState from "lib/models/ui/SliceState"

export enum Actions {
  RemoveWidget = 'variation-remove-widget'
}

export function removeWidget(state: SliceState, { id, modelFieldName, key }: { id: string, modelFieldName: WidgetsArea, key: string}): SliceState {
  return {
    ...state,
    variations: state.variations.map(variation => {
      if (variation.id === id) {
        return {
          ...variation,
          [modelFieldName]: Variation.getWidgetArea(variation, modelFieldName)?.filter(([widgetKey]) => widgetKey !== key)
        }
      }
      return variation
    })
  }
}