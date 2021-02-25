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
            variations: state.defaultVariations
          }
        })()
        case "save": return (() => {
          return {
            ...state,
            defaultVariations: state.variations
          }
        })()
        case VariationActions.RemoveWidget: return removeWidget(state, payload)
      }
    })();
    return {
      ...result,
      isTouched: !equal(result.defaultVariations, result.variations),
      __status: (() => {
        if (Boolean(!remoteSlice)) {
          return 'NEW_SLICE'
        }
        const remoteVariations = createVariations(remoteSlice)
        return !equal(remoteVariations, result.defaultVariations) ? 'MODIFIED' : 'SYNCED'
      })()
    }
  }
}
