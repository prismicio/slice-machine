import * as yup from "yup";
import { MdDateRange } from "react-icons/md";
import { MockConfigForm } from "./Mock/Form";

/** {
    "type" : "Timestamp",
    "config" : {
      "label" : "timestamp",
      "placeholder" : "timestamp"
    }
  } */

import { removeProp } from "../../../../utils";
import { DefaultFields } from "../../../../forms/defaults";
import { createValidationSchema } from "../../../../forms";
import { Widget } from "../Widget";
import { Timestamp } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

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
  MockConfigForm,
  create: (label: string) => ({
    type: WidgetTypes.Timestamp,
    config: {
      label,
      placeholder: "",
    },
  }),
  schema,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: WidgetTypes.Timestamp,
  Meta,
};
