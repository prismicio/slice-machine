import { Color } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdOutlineColorLens } from "react-icons/md";

import { createDefaultWidgetValues } from "../../../../utils";
import { Widget } from "../Widget";

/** {
  "type" : "Color",
  "config" : {
    "label" : "color"
  }
} */

const Meta = {
  icon: MdOutlineColorLens,
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME,
  schema,
  Meta,
};
