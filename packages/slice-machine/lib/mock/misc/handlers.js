import * as LinkToMediaMockWidget from "@lib/models/common/widgets/LinkToMedia/Mock";

const handleFieldMock = (widget, maybeFieldMock = {}, config) => {
  if (maybeFieldMock.content) {
    const { handleMockContent } = widget;
    if (handleMockContent) {
      const res = handleMockContent(maybeFieldMock.content, config);
      if (res) {
        return res;
      }
      console.warn(
        `[mock] content value is unsupported for field "${
          widget.TYPE_NAME || `dev log ${config}`
        }"`
      );
    }
  }
  const { handleMockConfig } = widget;
  if (handleMockConfig) {
    return handleMockConfig(
      maybeFieldMock ? maybeFieldMock.config || {} : {},
      config
    );
  }
  console.warn(
    `[slice-machine] "config" property for field type "${widget.TYPE_NAME}" is not yet supported.`
  );
  if (!widget.TYPE_NAME) {
    console.warn("[dev log] type name undef: ", config);
  }
  return widget.createMock ? widget.createMock(config || {}) : null;
};

export const handleFields =
  (Widgets) =>
  (fields = [], mocks = {}) => {
    return fields.reduce((acc, [key, value]) => {
      const typeName = value.type;
      const widget =
        typeName === "Link" && value.config?.select === "media"
          ? LinkToMediaMockWidget
          : Widgets[typeName];
      const maybeFieldMock = mocks[key];

      if (widget) {
        const mock = handleFieldMock(widget, maybeFieldMock, value.config);
        return {
          ...acc,
          [key]: mock,
        };
      }
      console.warn(
        `[slice-machine] Could not create mock for type "${value.type}": not supported.`
      );
      return acc;
    }, {});
  };
