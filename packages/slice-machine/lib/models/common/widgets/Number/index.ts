import { AiOutlineFieldNumber } from "react-icons/ai";
import { createDefaultWidgetValues } from "../../../../utils";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { NumberField } from "../types";
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

export const Number: Widget<NumberField, typeof schema> = {
  create: () => new NumberField(),
  MockConfigForm,
  handleMockConfig,
  handleMockContent,
  FormFields,
  TYPE_NAME: FieldType.Number,
  schema,
  Meta,
};
