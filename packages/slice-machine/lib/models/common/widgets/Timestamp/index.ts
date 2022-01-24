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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = DefaultFields;

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Timestamp$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  config: createValidationSchema(removeProp(FormFields, "id")),
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: FieldType.Timestamp,
  Meta,
};
