import { Input, InputType } from "./fields";

export const validateId = ({
  value,
  fields,
  initialId,
}: {
  value: string;
  fields: Array<{ key: string }>;
  initialId: string | null;
}) => {
  const fieldExists = fields.find(({ key }) => key === value);
  if (fieldExists && value !== initialId) {
    return `Field "${value}" already exists.`;
  }
};

export const DefaultFields: Record<string, InputType> = {
  label: Input(
    "Label",
    {
      required: "This field is required",
      max: true,
    },
    undefined,
    undefined,
    "Label for content creators (defaults to field type)"
  ),
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
    validateId,
    undefined,
    "A unique identifier for the field (e.g. buttonLink)"
  ),
  placeholder: Input(
    "Placeholder",
    {
      required: "This field is required",
      max: true,
    },
    undefined,
    undefined,
    "Placeholder text for content creators"
  ),
};
