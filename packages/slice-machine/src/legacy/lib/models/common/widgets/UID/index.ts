import { UID } from "@prismicio/types-internal/lib/customtypes/widgets";
import { MdVpnKey } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { DefaultFields } from "../../../../forms/defaults";
/**
* {
      "type": "UID",
      "config": {
        "label": "UID",
        "placeholder": "unique-identifier-eg-homepage"
      }
    }
 */
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";

const FormFields = {
  label: DefaultFields.label,
  id: {
    ...DefaultFields.id,
    validate: {
      required: "This field is required",
      matches: [/^uid$/, "Api ID must be 'uid' for this field."],
    },
    disabled: true,
  },
  placeholder: DefaultFields.placeholder,
};

const schema = yup.object().shape({
  type: yup.string().matches(/^UID$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: MdVpnKey,
  title: "UID",
  description: "Unique Identifier",
};

export const UIDWidget: Widget<UID, typeof schema> = {
  create: (label: string) => ({
    type: "UID",
    config: {
      label,
      placeholder: "",
    },
  }),
  Meta,
  schema,
  TYPE_NAME: "UID",
  FormFields,
};
