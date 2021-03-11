import equal from 'fast-deep-equal'
import SliceState from '../../../lib/models/ui/SliceState'

import {
  Actions as VariationActions,
  removeWidget
} from './variation/actions'

import {
  Actions as SliceActions,
  takeScreenshot,
  resetSlice,
  saveSlice,
  pushSlice
} from './actions'
import { LibStatus } from 'lib/models/common/Library';


export function reducer(prevState: SliceState, action: any): SliceState {
  const result: SliceState = (() => {
    switch(action.type) {
      case SliceActions.OnScreenShot: return takeScreenshot(prevState, action.payload)
      case SliceActions.Reset: return resetSlice(prevState)
      case SliceActions.Save: return saveSlice(prevState)
      case SliceActions.Push: return pushSlice(prevState)
      
      case VariationActions.RemoveWidget: return removeWidget(prevState, action.payload)
      
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
