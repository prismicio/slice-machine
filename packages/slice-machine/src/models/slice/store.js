
import { Actions as VariationActions } from './variation/actions';

export default class SliceStore {
  constructor(dispatch) {
    this.dispatch = dispatch
  }

  increment() {
    this.dispatch({ type: "ActionType.Increment" })
  }
  decrement() {
    this.dispatch({ type: "ActionType.Decrement" })
  }

  reset = () => {
    this.dispatch({ type: "reset" })
  }

  save = () => {
    this.dispatch({ type: 'save' })
  }

  onScreenshot = (previewUrl) => {
    this.dispatch({ type: 'on-screenshot', payload: previewUrl })
  }

  variation = (id) => {
    return {
      removeWidget: (modelFieldName, key) => {
        this.dispatch({ type: VariationActions.RemoveWidget, payload: { id, modelFieldName, key } })
      }
    }
  }
}