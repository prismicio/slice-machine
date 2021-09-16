import * as yup from "yup";
import { MdDns } from "react-icons/md";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";

import FormFields from "./FormFields";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { SelectField } from "../types";
import { FieldType } from "../../CustomType/fields";

/**
 * {
      "type" : "Select",
      "config" : {
        "label" : "Image side",
        "default_value" : "left",
        "options" : [ "left", "right" ]
      }
    }
*/

const Meta = {
  icon: MdDns,
  title: "Select",
  description: "A rich text field with formatting options",
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Select$/, { excludeEmptyString: true })
    .required(),
  config: createValidationSchema(removeProp(FormFields, "id")),
});

export const Select: Widget<SelectField, typeof schema> = {
  FormFields,
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  create: () => new SelectField(),
  schema,
  Meta,
  TYPE_NAME: FieldType.Select,
};
