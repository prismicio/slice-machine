import { FiCode } from "react-icons/fi";
import { createDefaultWidgetValues } from "../../../../utils";
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues(FieldType.Embed);

const Meta = {
  icon: FiCode,
  title: "Embed",
  description: "Embed videos, songs, tweets, slides, …",
};

export const EmbedWidget: Widget<EmbedField, typeof schema> = {
  create: (label: string) => new EmbedField({ label }),
  MockConfigForm,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: FieldType.Embed,
  schema,
  Meta,
};
