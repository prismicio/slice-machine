import SliceState from '../../../lib/models/ui/SliceState'

export enum Actions {
  Reset = 'reset',
  Save = 'save',
  Push = 'push',
  OnScreenShot = 'on-screenshot'
}

export function takeScreenshot(state: SliceState, payload: string): SliceState {
  return {
    ...state,
    infos: {
      ...state.infos,
      previewUrl: payload
    }
  }
}
export function resetSlice(state: SliceState): SliceState {
  return {
    ...state,
    variations: state.initialVariations
  }
}
export function saveSlice(state: SliceState): SliceState {
  return {
    ...state,
    initialVariations: state.variations
  }
}
export function pushSlice(state: SliceState): SliceState {
  return {
    ...state,
    initialPreviewUrl: state.infos.previewUrl,
    remoteVariations: state.variations,
  }
}