import * as yup from "yup";
import { MdDns } from "react-icons/md";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";

import FormFields from "./FormFields";

import { Widget } from "../Widget";
import { Select } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

/**
 * {
      "type" : "Select",
      "config" : {
        "label" : "Image side",
        "default_value" : "left",
        "options" : [ "left", "right" ]
      }
    }
*/

const Meta = {
  icon: MdDns,
  title: "Select",
  description: "A dropdown field of options for content creators.",
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Select$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  config: createValidationSchema(removeProp(FormFields, "id")),
});

export const SelectWidget: Widget<Select, typeof schema> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  create: (label: string) => ({
    type: "Select",
    config: {
      label,
      placeholder: "",
      options: ["1", "2"],
    },
  }),
  schema,
  Meta,
  TYPE_NAME: "Select",
};
