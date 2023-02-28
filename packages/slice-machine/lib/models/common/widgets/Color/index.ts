import { MdColorLens } from "react-icons/md";
import { createDefaultWidgetValues } from "../../../../utils";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";

import { Color } from "@prismicio/types-internal/lib/customtypes";

/** {
  "type" : "Color",
  "config" : {
    "label" : "color"
  }
} */

const Meta = {
  icon: MdColorLens,
  title: "Color",
  description: "A color picker",
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { TYPE_NAME, FormFields, schema } = createDefaultWidgetValues("Color");

export const ColorWidget: Widget<Color, typeof schema> = {
  create: (label: string) => ({
    type: "Color",
    config: {
      label,
      placeholder: "",
    },
  }),
  MockConfigForm,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME,
  schema,
  Meta,
};
