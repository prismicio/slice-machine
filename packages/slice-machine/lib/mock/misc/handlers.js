import * as LinkToMediaMockWidget from "@lib/models/common/widgets/LinkToMedia/Mock";

const handleFieldMock = (widget, maybeFieldMock = {}, config) => {
  if (maybeFieldMock.content) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { handleMockContent } = widget;
    if (handleMockContent) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const res = handleMockContent(maybeFieldMock.content, config);
      if (res) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return res;
      }
      console.warn(
        `[mock] content value is unsupported for field "${
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
          widget.TYPE_NAME || `dev log ${config}`
        }"`
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { handleMockConfig } = widget;
  if (handleMockConfig) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return handleMockConfig(
      maybeFieldMock ? maybeFieldMock.config || {} : {},
      config
    );
  }
  console.warn(
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    `[slice-machine] "config" property for field type "${widget.TYPE_NAME}" is not yet supported.`
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!widget.TYPE_NAME) {
    console.warn("[dev log] type name undef: ", config);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return widget.createMock ? widget.createMock(config || {}) : null;
};

export const handleFields =
  (Widgets) =>
  (fields = [], mocks = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fields.reduce((acc, { key, value }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const typeName = value.type;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const widget =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeName === "Link" && value.config?.select === "media"
          ? LinkToMediaMockWidget
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
            Widgets[typeName];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const maybeFieldMock = mocks[key];

      if (widget) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const mock = handleFieldMock(widget, maybeFieldMock, value.config);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          ...acc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          [key]: mock,
        };
      }
      console.warn(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
        `[slice-machine] Could not create mock for type "${value.type}": not supported.`
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return acc;
    }, {});
  };
