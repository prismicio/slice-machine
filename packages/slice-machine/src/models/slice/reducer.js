import equal from 'fast-deep-equal'
import { createVariations } from '../helpers'

import {
  Actions as VariationActions,
  removeWidget
} from './variation/actions'


export function reducer(remoteSlice, sliceName) {
  return (state, { type, payload }) => {
    const result = (() => {
      switch(type) {
        case "on-screenshot": return (() => {
          console.log({ type, payload })
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
      status: (() => {
        if (Boolean(!remoteSlice)) {
          return 'NEW_SLICE'
        }
        const remoteVariations = createVariations(remoteSlice)
        return !equal(remoteVariations, result.defaultVariations) ? 'MODIFIED' : 'SYNCED'
      })()
      
    }
  }
}

/**
 * remote slice variations (comparaison entre remote slice et file system)
 * state variations (client et file system)
 * form variations (entre client et données du form)
 */