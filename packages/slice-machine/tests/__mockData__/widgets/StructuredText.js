export const valid = {
  __pass: true,
  type: "StructuredText",
  config: {
    label: "Title",
    allowMultiLine: false,
    allowTargetBlank: 1,
    accepts: ["heading1, heading2, heading3, heading4, heading5, heading6"]
  }
}

export const wrongType = {
  __pass: false,
  type: "StructuredText2",
  config: {
    label: "Title",
    allowMultiLine: true,
    allowTargetBlank: 1,
    accepts: ["heading1, heading2, heading3, heading4, heading5, heading6"]
  }
}

export const wrongOption = {
  __pass: false,
  type: "StructuredText2",
  config: {
    label: "Title",
    allowMultiLine: false,
    allowTargetBlank: true,
    accepts: ["wrong"]
  }
}

export const wrongTargetType = {
  __pass: false,
  type: "StructuredText2",
  config: {
    label: "Title",
    allowMultiLine: true,
    allowTargetBlank: 1,
    accepts: ["heading1, heading2, heading3, heading4, heading5, heading6"]
  }
}

