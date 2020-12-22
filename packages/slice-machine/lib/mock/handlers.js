const handleFieldMock = (widget, maybeFieldMock = {}, config) => {
  if (maybeFieldMock.content) {
    const { handleMockContent } = widget
    if (handleMockContent) {
      return handleMockContent(maybeFieldMock.content, config)
    }
    return maybeFieldMock.content
  }
  const { handleMockConfig } = widget
  if (maybeFieldMock.config && handleMockConfig) {
    return handleMockConfig(maybeFieldMock.config || {}, config)
  }
  // console.warn(`[slice-machine] "config" property for field type "${widget.TYPE_NAME}" is not yet supported.`)
  return widget.createMock ? widget.createMock(config || {}) : null
}

export const handleFields = (Widgets) => (fields = [], mocks = {}) => {
  return fields.reduce((acc, [key, value]) => {
    const widget = Widgets[value.type]
    const maybeFieldMock = mocks[key]

    if (widget) {
      const mock = handleFieldMock(widget, maybeFieldMock, value.config)
      return {
        ...acc,
        [key]: mock
      }
    }
    console.warn(`[slice-machine] Could not create mock for type "${value.type}": not supported.`)
    return acc
  }, {})
}