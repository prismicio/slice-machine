// {
//   "type": "Link",
//   config: {
//      label: "My label",
//      select: "document",
//      customtypes: ["my-ct"],
//   }
// }

export const valid = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
    customtypes: ['my-ct']
  }
}

export const emptycts = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
    customtypes: []
  }
}

export const nocts = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
  }
}

export const ctsNotStrings = {
  __pass: false,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
    customtypes: [1]
  }
}

export const selectNotDoc = {
  __pass: false,
  type: "Link",
  config: {
    select: 'document2',
    label: "bool",
    customtypes: ['1']
  }
}

/** Should this pass? */
export const noLabel = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    customtypes: ['1']
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