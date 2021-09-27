export const valid = {
  __pass: true,
  type: "Timestamp",
  config: {
    label: "...",
    placeholder: "...",
  },
};

export const wrongType = {
  __pass: false,
  type: "Time2Travel",
  config: {
    label: "Title",
    placeholder: "key text",
  },
};

export const noConfig = {
  __pass: false,
  type: "Timestamp",
};

export const labelTooLong = {
  __pass: false,
  type: "Timestamp",
  config: {
    label:
      "This is so long it should not pass yup validation (max 35 characters right now but it could change ✌️)",
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
