import { Date } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdDateRange } from "react-icons/md";

import { createDefaultWidgetValues } from "../../../../utils";
import { Widget } from "../Widget";

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues("Date");

const Meta = {
  icon: MdDateRange,
};

export const DateWidget: Widget<Date, typeof schema> = {
  create: (label: string) => ({
    type: "Date",
    config: {
      label,
      placeholder: "",
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: "Date",
  schema,
  Meta,
};
