export const valid = {
  __pass: true,
  type: "Link",
  config: {
    select: "media",
    label: "bool",
  },
};

export const selectNotMedia = {
  __pass: false,
  type: "Link",
  config: {
    select: "document",
    label: "bool",
  },
};

export const invalidSelect = {
  __pass: false,
  type: "Link",
  config: {
    select: "media2",
    label: "bool",
  },
};

export const noLabel = {
  __pass: true,
  type: "Link",
  config: {
    select: "media",
  },
};

export const misplacedId = {
  ...valid,
  __pass: false,
  config: {
    ...valid.config,
    id: "some-id",
  },
};
