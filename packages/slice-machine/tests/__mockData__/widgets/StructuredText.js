export const valid = {
  __pass: true,
  type: "StructuredText",
  config: {
    label: "Title",
    single: "p",
    allowTargetBlank: 1,
  }
}

export const multi = {
  __pass: true,
  type: "StructuredText",
  config: {
    label: "Title",
    allowTargetBlank: true,
    multi: 'p,h1,h2'
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
    multi: ["p", "h1"]
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

