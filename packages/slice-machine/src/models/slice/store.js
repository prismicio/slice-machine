
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

  variation(id) {
    return {
      removeWidget(modelFieldName, key) {
        this.dispatch({ type: VariationActions.RemoveWidget, payload: { id, modelFieldName, key } })
      }
    }
  }
}