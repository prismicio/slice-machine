import { MdColorLens } from "react-icons/md";
import { createDefaultWidgetValues } from "../../../../utils";
import { handleMockContent, handleMockConfig } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";

import { FieldType } from "../../CustomType/fields";
import { ColorField } from "./type";

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
  FieldType.Color
);

export const ColorWidget: Widget<ColorField, typeof schema> = {
  handleMockContent,
  handleMockConfig,
  create: (label: string) => new ColorField({ label }),
  MockConfigForm,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME,
  schema,
  Meta,
};
