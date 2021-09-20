// {
//   "type": "Boolean",
//   "config": {
//     "placeholder_false": "false placeholder",
//     "placeholder_true": "true placeholder",
//     "default_value": true,
//     "label": "bool"
//   }

export const valid = {
  __pass: true,
  type: "Boolean",
  config: {
    placeholder_false: "false placeholder",
    placeholder_true: "true placeholder",
    default_value: true,
    label: "bool",
  },
};

export const emptyTexts = {
  __pass: true,
  type: "Boolean",
  config: {
    default_value: true,
  },
};

export const noDefaultValue = {
  __pass: false,
  type: "Boolean",
  config: {
    placeholder_false: "false placeholder",
    placeholder_true: "true placeholder",
    label: "bool",
  },
};

export const valueNotBool = {
  __pass: false,
  type: "Boolean",
  config: {
    default_value: 12,
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
