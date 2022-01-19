import * as yup from "yup";
import { MdDns } from "react-icons/md";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";

import FormFields from "./FormFields";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { SelectField } from "./type";
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  config: createValidationSchema(removeProp(FormFields, "id")),
});

export const SelectWidget: Widget<SelectField, typeof schema> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  create: (label: string) => new SelectField({ label }),
  schema,
  Meta,
  TYPE_NAME: FieldType.Select,
};
