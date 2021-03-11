
import { WidgetsArea } from 'lib/models/common/Variation';
import { Actions as VariationActions } from './variation/actions';
import { Actions as SliceActions } from './actions';
import Store from 'lib/models/ui/Store';

export default class SliceStore implements Store {
  constructor(readonly dispatch: ({ type, payload }: { type: string, payload?: any }) => void) {}

  reset = () => this.dispatch({ type: SliceActions.Reset })
  save = () => this.dispatch({ type: SliceActions.Save })
  push = () => this.dispatch({ type: SliceActions.Push })
  onScreenshot = (previewUrl: string) => this.dispatch({ type: SliceActions.OnScreenShot, payload: previewUrl })

  variation = (id: string) => {
    return {
      removeWidget: (modelFieldName: WidgetsArea, key: string) => {
        this.dispatch({ type: VariationActions.RemoveWidget, payload: { id, modelFieldName, key } })
      }
    }
  }
}