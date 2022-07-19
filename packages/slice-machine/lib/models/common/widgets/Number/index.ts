import { AiOutlineFieldNumber } from "react-icons/ai";
import { createDefaultWidgetValues } from "../../../../utils";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { Number as PrismicNumber } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

/** {
    "type" : "Number",
    "config" : {
      "label" : "number",
      "placeholder" : "Some number"
    }
  } */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues(WidgetTypes.Number);

const Meta = {
  icon: AiOutlineFieldNumber,
  title: "Number",
  description: "A number input field",
};

export const NumberWidget: Widget<PrismicNumber, typeof schema> = {
  create: (label: string) => ({
    type: WidgetTypes.Number,
    config: {
      label,
      placeholder: "",
    },
  }),
  MockConfigForm,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: WidgetTypes.Number,
  schema,
  Meta,
};
