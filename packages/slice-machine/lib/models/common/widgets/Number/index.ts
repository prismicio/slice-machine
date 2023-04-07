import { AiOutlineFieldNumber } from "react-icons/ai";
import { createDefaultWidgetValues } from "../../../../utils";

import { Widget } from "../Widget";
import { Number as PrismicNumber } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

/** {
    "type" : "Number",
    "config" : {
      "label" : "number",
      "placeholder" : "Some number"
    }
  } */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues("Number");

const Meta = {
  icon: AiOutlineFieldNumber,
  title: "Number",
  description: "A number input field",
};

export const NumberWidget: Widget<PrismicNumber, typeof schema> = {
  create: (label: string) => ({
    type: "Number",
    config: {
      label,
      placeholder: "",
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: "Number",
  schema,
  Meta,
};
