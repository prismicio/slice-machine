// {
//   "type": "UID",
//   "config": {
//     "placeholder": "placeholder",
//     "label": "label"
//   }

export const valid = {
  __pass: true,
  type: "UID",
  config: {
    label: "UID",
    placeholder: "my UID",
  },
};

export const wrongType = {
  __pass: false,
  type: "UID2",
  config: {
    label: "UID",
    placeholder: "my UID",
  },
};

export const noConfig = {
  __pass: false,
  type: "UID",
};

export const misplacedId = {
  ...valid,
  __pass: false,
  config: {
    ...valid.config,
    id: "some-id",
  },
};
