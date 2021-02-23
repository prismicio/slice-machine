import equal from 'fast-deep-equal'

const Types = {
  DELETE_IN_VARIATION: 'deleteInVariation'
}

const reduce = (state, action) => {
  if (action.type === Types.DELETE_IN_VARIATION) {
    const {
      payload: {
        key,
        modelFieldName,
        variationId
      }
    } = action
    return {
      ...state,
      variations: state.variations.map(variation => {
        if (variation.id === variationId) {
          return {
            ...variation,
            [modelFieldName]: variation[modelFieldName].filter(e => e.key !== key)
          }
        }
        return variation
      })
    }
  }
  return state
}

export default class SliceStore {
  constructor(dispatch, initialVariations, initialMockConfig) {
    this.dispatch = dispatch
    this.initialVariations = initialVariations
    this.initialMockConfig = initialMockConfig
  }
  static reducer(initialVariations) {
    console.log('new reducer')
    return (state, action) => {
      const newState = reduce(state, action)
      const newState1 = {
        ...newState,
        __isHere: true,
        isTouched: !equal(initialVariations, newState.variations),
      }
      return newState1
    }
  }
  withContextualValue(newState) {
    return {
      ...newState,
      isModified: true
    }
  }
  deleteItemInVariation(variationId, modelFieldName, key) {
    this.dispatch({
      type: Types.DELETE_IN_VARIATION,
      payload: {
        key,
        variationId,
        modelFieldName
      }
    })
  }
  increment() {
    this.dispatch({ type: "ActionType.Increment" })
  }
  decrement() {
    this.dispatch({ type: "ActionType.Decrement" })
  }
}