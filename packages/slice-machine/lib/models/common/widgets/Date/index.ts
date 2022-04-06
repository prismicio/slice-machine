import { MdDateRange } from "react-icons/md";
import { createDefaultWidgetValues } from "../../../../utils";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { DEFAULT_CONFIG, Widget } from "../Widget";
import { Date } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { FormFields, schema } = createDefaultWidgetValues(WidgetTypes.Date);

const Meta = {
  icon: MdDateRange,
  title: "Date",
  description: "A calendar date picker",
};

export const DateWidget: Widget<Date, typeof schema> = {
  create: (label: string) => ({
    type: WidgetTypes.Date,
    config: {
      ...DEFAULT_CONFIG,
      label,
    },
  }),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  TYPE_NAME: WidgetTypes.Date,
  schema,
  Meta,
};
