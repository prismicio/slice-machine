import { RichText } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdTextFields } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";
import Form, { FormFields } from "./Form";
import { optionValues } from "./options";

/**
 * {
    "type": "StructuredText",
    "config": {
      "label": "Title",
      "single": "heading1, heading2, heading3, heading4, heading5, heading6"
    }
  }
*/

const Meta = {
  icon: MdTextFields,
};

const ManualFields = {
  labels: { yupType: "array", validate: {} },
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^StructuredText$/, { excludeEmptyString: true })
    .required(),
  config: createValidationSchema(
    removeProp(
      { ...(FormFields as Record<string, unknown>), ...ManualFields },
      "id",
    ),
  ),
});

export const StructuredTextWidget: Widget<RichText, typeof schema> = {
  create: (label: string) => ({
    type: "StructuredText",
    config: {
      label,
      placeholder: "",
      allowTargetBlank: true,
      multi: optionValues.join(","),
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  Meta,
  schema,
  TYPE_NAME: "StructuredText",
  Form,
};
