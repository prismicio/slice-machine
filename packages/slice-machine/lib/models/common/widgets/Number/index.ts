import { AiOutlineFieldNumber } from "react-icons/ai";
import { createDefaultWidgetValues } from "../../../../utils";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { NumberField } from "./type";
import { FieldType } from "../../CustomType/fields";

/** {
    "type" : "Number",
    "config" : {
      "label" : "number",
      "placeholder" : "Some number"
    }
  } */

const { FormFields, schema } = createDefaultWidgetValues(FieldType.Number);

const Meta = {
  icon: AiOutlineFieldNumber,
  title: "Number",
  description: "Numbers",
};

export const NumberWidget: Widget<NumberField, typeof schema> = {
  create: (label: string) => new NumberField({ label }),
  MockConfigForm,
  handleMockConfig,
  handleMockContent,
  FormFields,
  TYPE_NAME: FieldType.Number,
  schema,
  Meta,
};
