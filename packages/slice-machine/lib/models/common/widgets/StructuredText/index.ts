import * as yup from "yup";
import Form, { FormFields } from "./Form";

import { MdTextFields } from "react-icons/md";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";

import { optionValues } from "./options";
import { RichText } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

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
  title: "Rich Text",
  description: "A rich text field with formatting options",
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
      "id"
    )
  ),
});

export const StructuredTextWidget: Widget<RichText, typeof schema> = {
  create: (label: string) => ({
    type: "StructuredText",
    config: {
      label,
      placeholder: "",
      allowTargetBlank: true,
      single: optionValues.join(","),
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  Meta,
  schema,
  TYPE_NAME: "StructuredText",
  Form,
};
