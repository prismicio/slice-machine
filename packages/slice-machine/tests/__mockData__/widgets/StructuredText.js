export const valid = {
  __pass: true,
  type: "StructuredText",
  config: {
    label: "Title",
    single: "paragraph",
    allowTargetBlank: 1,
  }
}

export const multi = {
  __pass: true,
  type: "StructuredText",
  config: {
    label: "Title",
    allowTargetBlank: true,
    multi: 'paragraph,heading1,heading2'
  }
}

export const undefOptions = {
  __pass: false,
  type: "StructuredText",
  config: {
    label: "Title",
    allowTargetBlank: true,
  }
}

export const emptyOptions = {
  __pass: false,
  type: "StructuredText",
  config: {
    label: "Title",
    allowTargetBlank: true,
    multi: ''
  }
}

export const wrongOptionType = {
  __pass: false,
  type: "StructuredText2",
  config: {
    multi: ["paragraph", "heading1"]
  }
}

export const wrongOptions = {
  __pass: false,
  type: "StructuredText2",
  config: {
    label: "Title",
    single: "p,z"

  }
}

export const misplacedId = {
  ...valid,
  __pass: false,
  config: {
    ...valid.config,
    id: 'some-id'
  }
}