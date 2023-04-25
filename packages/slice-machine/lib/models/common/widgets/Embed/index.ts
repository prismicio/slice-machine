import { FiCode } from "react-icons/fi";
import { createDefaultWidgetValues } from "../../../../utils";

import { Widget } from "../Widget";
import { Embed } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

/**  {
  "type" : "Embed",
  "config" : {
    "label" : "embed",
    "placeholder" : "dddd"
  }
} */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues("Embed");

const Meta = {
  icon: FiCode,
  title: "Embed",
  description: "Embed videos, songs, tweets, slides, …",
};

export const EmbedWidget: Widget<Embed, typeof schema> = {
  create: (label: string) => ({
    type: "Embed",
    config: {
      label,
      placeholder: "",
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: "Embed",
  schema,
  Meta,
};
