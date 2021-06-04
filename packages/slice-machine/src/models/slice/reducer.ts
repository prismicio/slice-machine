import equal from 'fast-deep-equal'
import { Variation, AsArray } from '../../../lib/models/common/Variation'
import SliceState from '../../../lib/models/ui/SliceState'
import { WidgetsArea } from '../../../lib/models/common/Variation'
import { ComponentMetadata, Preview } from '../../../lib/models/common/Component'
import { Widget } from '../../../lib/models/common/widgets'

import {
  ActionType as VariationActions,
} from './variation/actions'

import {
  ActionType as SliceActions
} from './actions'

import { LibStatus } from '../../../lib/models/common/Library'


export function reducer(prevState: SliceState, action: { type: string, payload?: unknown }): SliceState {
  const result = ((): SliceState => {
    switch(action.type) {
      case SliceActions.Reset: return {
        ...prevState,
        variations: prevState.initialVariations
      }
      case SliceActions.Save: {
        const { state } = action.payload as { state: SliceState }
        return state
      }
      case SliceActions.Push: return {
        ...prevState,
        initialPreviewUrls: prevState.infos.previewUrls,
        remoteVariations: prevState.variations,
      }
      case SliceActions.UpdateMetadata: return {
        ...prevState,
        infos: {
          ...prevState.infos,
          ...(action.payload as ComponentMetadata)
        }
      }
      case SliceActions.CopyVariation: {
        const { key, name, copied } = action.payload as { key: string, name: string, copied: Variation<AsArray> }
        return {
          ...prevState,
          variations: prevState.variations.concat([Variation.copyValue(copied, key, name)])
        }
      }
      case VariationActions.GenerateScreenShot: {
        const { previews } = action.payload as { variationId: string, previews: ReadonlyArray<Preview> }
        const previewsByVariation = previews.reduce((acc, p) => ({ ...acc, [p.variationId]: p }), {})
        
        return {
          ...prevState,
          infos: {
            ...prevState.infos,
            previewUrls: {
              ...prevState.infos.previewUrls,
              ...previewsByVariation
            }
          }
        }
      }
      case VariationActions.AddWidget: {
        const { variationId, widgetsArea, key, value } = action.payload as { variationId: string, widgetsArea: WidgetsArea, key: string, value: Widget }
        return SliceState.updateVariation(prevState, variationId)(v => Variation.addWidget(v, widgetsArea, key, value))
      }
      case VariationActions.ReplaceWidget: {
        const { variationId, widgetsArea, previousKey, newKey, value } = action.payload as { variationId: string, widgetsArea: WidgetsArea, previousKey: string, newKey: string, value: Widget }
        return SliceState.updateVariation(prevState, variationId)(v => Variation.replaceWidget(v, widgetsArea, previousKey, newKey, value))
      }
      case VariationActions.ReorderWidget: {
        const { variationId, widgetsArea, start, end } = action.payload as { variationId: string, widgetsArea: WidgetsArea, start: number, end: number }
        return SliceState.updateVariation(prevState, variationId)(v => Variation.reorderWidget(v, widgetsArea, start, end))
      }
      case VariationActions.RemoveWidget: {
        const { variationId, widgetsArea, key } = action.payload as { variationId: string, widgetsArea: WidgetsArea, key: string }
        return SliceState.updateVariation(prevState, variationId)(v => Variation.deleteWidget(v, widgetsArea, key))
      }
      case VariationActions.UpdateWidgetMockConfig:
        return {
        ...prevState,
        mockConfig: (action.payload as any)
      }

      case VariationActions.DeleteWidgetMockConfig:
        return {
        ...prevState,
        mockConfig: (action.payload as any)
      }
      
      default: throw new Error("Invalid action.")
    }
  })();
  return {
    ...result,
    isTouched: (()=> {
      return !equal(result.initialVariations, result.variations) || !equal(result.initialMockConfig, result.mockConfig)
    })(),
    __status: (() => {
      return result.infos.previewUrls !== result.initialPreviewUrls
      || !equal(result.remoteVariations, result.initialVariations)
      ? LibStatus.Modified
      : LibStatus.Synced
    })()
  }
}
