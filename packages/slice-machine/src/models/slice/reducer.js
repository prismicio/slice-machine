import equal from 'fast-deep-equal'

import { remove } from '../variation/actions'
import { Actions as SliceActions } from './actions'

import {
  Actions as VariationActions,
  remove
} from './variation/actions'

export function reducer(initialVariations) {
  const result = ((state, { type, payload }) => {
    switch(type) {
      case SliceActions.Rename: return state
      case VariationActions.RemoveWidget: return remove(state, payload)
    }
  })()

  return {
    ...result,
    isTouched: !equal(initialVariations, newState.variations)
  }
}