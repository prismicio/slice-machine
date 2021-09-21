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

const { TYPE_NAME, FormFields, schema } = createDefaultWidgetValues(
  FieldType.Color
);

export const ColorWidget: Widget<ColorField, typeof schema> = {
  handleMockContent,
  handleMockConfig,
  create: (label: string) => new ColorField({ label }),
  MockConfigForm,
  FormFields,
  TYPE_NAME,
  schema,
  Meta,
};
