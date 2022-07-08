import { Input } from "./fields";

export const validateId = ({
  value,
  fields,
  initialId,
}: {
  value: string;
  fields: Array<{ key: string }>;
  initialId: string;
}) => {
  if (!value) {
    return "Field is required";
  }
  const fieldExists = fields.find(({ key }) => key === value);
  if (fieldExists && value !== initialId) {
    return `Field "${value}" already exists.`;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DefaultFields: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  label: Input("Label", { required: "This field is required", max: true }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  id: Input(
    "API ID*",
    {
      min: true,
      max: true,
      required: "This field is required",
      matches: [
        /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/,
        "No special characters allowed",
      ],
    },
    validateId
  ),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  placeholder: Input("Placeholder", {
    required: "This field is required",
    max: true,
  }),
};
