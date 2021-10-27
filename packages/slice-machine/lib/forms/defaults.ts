/* eslint-disable */
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
  const fieldExists = fields.find(({ key }) => key === value);
  if (fieldExists && value !== initialId) {
    return `Field "${value}" already exists.`;
  }
};

export const DefaultFields: any = {
  label: Input("Label", { required: "This field is required", max: true }),
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
  placeholder: Input("Placeholder", {
    required: "This field is required",
    max: true,
  }),
};
