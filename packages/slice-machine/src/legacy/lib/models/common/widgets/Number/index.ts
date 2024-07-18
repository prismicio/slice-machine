import { Number as PrismicNumber } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdOutlinePin } from "react-icons/md";

import { createDefaultWidgetValues } from "../../../../utils";
import { Widget } from "../Widget";

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
  icon: MdOutlinePin,
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
