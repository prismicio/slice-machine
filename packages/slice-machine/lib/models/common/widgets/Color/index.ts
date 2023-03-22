import { MdColorLens } from "react-icons/md";
import { createDefaultWidgetValues } from "../../../../utils";

import { Widget } from "../Widget";

import { Color } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

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
const { TYPE_NAME, FormFields, schema } = createDefaultWidgetValues(
  WidgetTypes.Color
);

export const ColorWidget: Widget<Color, typeof schema> = {
  create: (label: string) => ({
    type: WidgetTypes.Color,
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
