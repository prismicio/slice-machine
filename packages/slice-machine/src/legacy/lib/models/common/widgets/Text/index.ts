import { Text } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdTitle } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { DefaultFields } from "../../../../forms/defaults";
/**
* {
     "type": "Text",
    "config": {
      "label": "person",
      "placeholder": "Their full name"
    }
  }
 */
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = DefaultFields;

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Text$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: MdTitle,
};

export const TextWidget: Widget<Text, typeof schema> = {
  create: (label: string) => ({
    type: "Text",
    config: {
      label,
      placeholder: "",
    },
  }),
  Meta,
  schema,
  TYPE_NAME: "Text",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
};
