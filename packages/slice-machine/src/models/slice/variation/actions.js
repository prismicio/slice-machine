export const Actions = {
  RemoveWidget: 'variation-remove-widget'
}

export function removeWidget(state, { id, modelFieldName, key }) {
  return {
    ...state,
    variations: state.variations.map(variation => {
      if (variation.id === id) {
        return {
          ...variation,
          [modelFieldName]: variation[modelFieldName].filter(e => e.key !== key)
        }
      }
      return variation
    })
  }
}