import equal from 'fast-deep-equal'
import { Variation } from '../../../lib/models/common/Variation'
import { SliceState } from '../../../lib/models/ui/SliceState'
import { WidgetsArea } from '../../../lib/models/common/Variation'
import { ComponentMetadata } from '../../../lib/models/common/Component'
import { Widget } from '../../../lib/models/common/widgets'

import {
  ActionType as VariationActions,
} from './variation/actions'

import {
  ActionType as SliceActions
} from './actions'
import { LibStatus } from 'lib/models/common/Library';


export function reducer(prevState: SliceState, action: { type: string, payload?: unknown }): SliceState {
  const result = ((): SliceState => {
    switch(action.type) {
      case SliceActions.GenerateScreenShot: return {
        ...prevState,
        infos: {
          ...prevState.infos,
          previewUrl: (action.payload as string)
        }
      }
      case SliceActions.Reset: return {
        ...prevState,
        variations: prevState.initialVariations
      }
      case SliceActions.Save: return {
        ...prevState,
        initialVariations: prevState.variations
      }
      case SliceActions.Push: return {
        ...prevState,
        initialPreviewUrl: prevState.infos.previewUrl,
        remoteVariations: prevState.variations,
      }
      case SliceActions.UpdateMetadata: return {
        ...prevState,
        infos: {
          ...prevState.infos,
          ...(action.payload as ComponentMetadata)
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
    isTouched: !equal(result.initialVariations, result.variations) || !equal(result.initialMockConfig, result.mockConfig),
    __status: (() => {
      return result.infos.previewUrl !== result.initialPreviewUrl
      || !equal(result.remoteVariations, result.initialVariations)
      ? LibStatus.Modified
      : LibStatus.Synced
    })()
  }
}
