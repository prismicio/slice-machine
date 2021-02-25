import equal from 'fast-deep-equal'
import { createVariations } from '../helpers'

import {
  Actions as VariationActions,
  removeWidget
} from './variation/actions'


export function reducer(remoteSlice) {
  return (state, { type, payload }) => {
    const result = (() => {
      switch(type) {
        case "on-screenshot": return (() => {
          return {
            ...state,
            previewUrl: payload
          }
        })()
        case "reset": return (() => {
          return {
            ...state,
            variations: state.initialVariations
          }
        })()
        case "save": return (() => {
          return {
            ...state,
            initialVariations: state.variations
          }
        })()
        case "push": return (() => {
          return {
            ...state,
            initialPreviewUrl: state.previewUrl,
            remoteVariations: state.variations,
          }
        })()
        case VariationActions.RemoveWidget: return removeWidget(state, payload)
      }
    })();
    return {
      ...result,
      isTouched: !equal(result.initialVariations, result.variations) || !equal(result.initialMockConfig, result.mockConfig),
      __status: (() => {
        return result.previewUrl !== result.initialPreviewUrl
          || !equal(result.remoteVariations, result.initialVariations)
          ? 'MODIFIED'
          : 'SYNCED'
      })()
    }
  }
}
