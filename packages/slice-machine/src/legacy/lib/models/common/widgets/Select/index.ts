import { Select } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdOutlineArrowDropDownCircle } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";
import FormFields from "./FormFields";

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
  icon: MdOutlineArrowDropDownCircle,
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
