export const valid = {
  __pass: true,
  type: "Link",
  config: {
    select: 'media',
    label: "bool",
  }
}

export const emptycts = {
  __pass: true,
  type: "Link",
  config: {
    select: 'media',
    label: "bool",
  }
}

export const nocts = {
  __pass: true,
  type: "Link",
  config: {
    select: 'media',
    label: "bool",
  }
}

export const ctsNotStrings = {
  __pass: false,
  type: "Link",
  config: {
    select: 'media',
    label: "bool",
  }
}

export const selectNotDoc = {
  __pass: false,
  type: "Link",
  config: {
    select: 'media2',
    label: "bool",
  }
}

/** Should this pass? */
export const noLabel = {
  __pass: true,
  type: "Link",
  config: {
    select: 'media',
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