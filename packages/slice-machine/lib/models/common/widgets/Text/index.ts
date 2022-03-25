import * as yup from "yup";
import { MdTitle } from "react-icons/md";
import { MockConfigForm } from "./Mock/Form";
/**
* {
     "type": "Text",
    "config": {
      "label": "person",
      "placeholder": "Their full name"
    }
  }
 */

import { removeProp } from "../../../../utils";
import { DefaultFields } from "../../../../forms/defaults";
import { createValidationSchema } from "../../../../forms";
import { DEFAULT_CONFIG, Widget } from "../Widget";
import { Text } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = DefaultFields;

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Text$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: MdTitle,
  title: "Key Text",
  description: "Text content",
};

export const TextWidget: Widget<Text, typeof schema> = {
  create: (label: string) => ({
    type: WidgetTypes.Text,
    config: { ...DEFAULT_CONFIG, label },
  }),
  MockConfigForm,
  Meta,
  schema,
  TYPE_NAME: WidgetTypes.Text,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
};
