import { Input, InputType } from "./fields";
import { API_ID_REGEX } from "../consts";

export const validateId = ({
  value,
  fields,
  initialId,
}: {
  value: string;
  fields: Array<{ key: string }>;
  initialId: string | null;
}) => {
  if (!value) {
    return "Field is required";
  }
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
      matches: [API_ID_REGEX, "No special characters allowed (except _)"],
    },
    validateId,
    undefined,
    "A unique identifier for the field (e.g. buttonLink)"
  ),
  placeholder: Input(
    "Placeholder",
    {
      required: "This field is required",
      max: [100, "String is too long. Max: 100"],
    },
    undefined,
    undefined,
    "Placeholder text for content creators"
  ),
};
