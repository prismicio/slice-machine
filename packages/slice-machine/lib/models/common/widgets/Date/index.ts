import { MdDateRange } from "react-icons/md";
import { createDefaultWidgetValues } from "../../../../utils";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { DateField } from "./type";
import { FieldType } from "../../CustomType/fields";

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues(FieldType.Date);

const Meta = {
  icon: MdDateRange,
  title: "Date",
  description: "A calendar date picker",
};

export const DateWidget: Widget<DateField, typeof schema> = {
  create: (label: string) => new DateField({ label }),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: FieldType.Date,
  schema,
  Meta,
};
