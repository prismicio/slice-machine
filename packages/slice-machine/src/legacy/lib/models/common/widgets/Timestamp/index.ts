import { Timestamp } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdDateRange } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { DefaultFields } from "../../../../forms/defaults";
/** {
    "type" : "Timestamp",
    "config" : {
      "label" : "timestamp",
      "placeholder" : "timestamp"
    }
  } */
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = DefaultFields;

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Timestamp$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: MdDateRange,
  title: "Timestamp",
  description: "A calendar date picker with time",
};

export const TimestampWidget: Widget<Timestamp, typeof schema> = {
  create: (label: string) => ({
    type: "Timestamp",
    config: {
      label,
      placeholder: "",
    },
  }),
  schema,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: "Timestamp",
  Meta,
};
