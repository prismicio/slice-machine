import { FiCode } from "react-icons/fi";
import { createDefaultWidgetValues } from "../../../../utils";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { EmbedField } from "./type";
import { FieldType } from "../../CustomType/fields";

/**  {
  "type" : "Embed",
  "config" : {
    "label" : "embed",
    "placeholder" : "dddd"
  }
} */

const { FormFields, schema } = createDefaultWidgetValues(FieldType.Embed); // eslint-disable-line

const Meta = {
  icon: FiCode,
  title: "Embed",
  description: "Embed videos, songs, tweets, slides, …",
};

export const EmbedWidget: Widget<EmbedField, typeof schema> = {
  create: (label: string) => new EmbedField({ label }),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  FormFields, // eslint-disable-line
  TYPE_NAME: FieldType.Embed,
  schema,
  Meta,
};
