import { BooleanField } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdOutlineToggleOff } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { DefaultFields } from "../../../../forms/defaults";
import { CheckBox, Input } from "../../../../forms/fields";
/** {
    "type" : "Boolean",
    "config" : {
      "placeholder_false" : "false placeholder",
      "placeholder_true" : "true placeholder",
      "default_value" : true,
      "label" : "bool"
    }
  } */
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";

const Meta = {
  icon: MdOutlineToggleOff,
};

const FormFields = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  label: DefaultFields.label,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  id: DefaultFields.id,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  placeholder_false: Input(
    "False Placeholder",
    { required: false },
    null,
    "false",
    "Value the content creator sees (Output as 'false' in the API).",
  ),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  placeholder_true: Input(
    "True Placeholder",
    { required: false },
    null,
    "true",
    "Value the content creator sees (Output as 'true' in the API)",
  ),
  default_value: CheckBox("Default to true"),
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Boolean$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  config: createValidationSchema(removeProp(FormFields, "id")),
});

export const BooleanWidget: Widget<BooleanField, typeof schema> = {
  TYPE_NAME: "Boolean",
  create: (label: string) => ({
    type: "Boolean",
    config: {
      label,
      default_value: false,
      placeholder_true: "true",
      placeholder_false: "false",
    },
  }),
  Meta,
  schema,
  FormFields,
};
