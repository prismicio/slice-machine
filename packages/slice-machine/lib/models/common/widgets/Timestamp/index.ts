import * as yup from "yup";
import { MdDateRange } from "react-icons/md";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

/** {
    "type" : "Timestamp",
    "config" : {
      "label" : "timestamp",
      "placeholder" : "timestamp"
    }
  } */

import { removeProp } from "../../../../utils";
import { DefaultFields } from "../../../../forms/defaults";
import { createValidationSchema } from "../../../../forms";
import { Widget } from "../Widget";
import { TimestampField } from "./type";
import { FieldType } from "../../CustomType/fields";

const FormFields = DefaultFields; // eslint-disable-line

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Timestamp$/, { excludeEmptyString: true })
    .required(),
  config: createValidationSchema(removeProp(FormFields, "id")), // eslint-disable-line
});

const Meta = {
  icon: MdDateRange,
  title: "Timestamp",
  description: "A calendar date picker with time",
};

export const TimestampWidget: Widget<TimestampField, typeof schema> = {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  create: (label: string) => new TimestampField({ label }),
  schema,
  FormFields, // eslint-disable-line
  TYPE_NAME: FieldType.Timestamp,
  Meta,
};
