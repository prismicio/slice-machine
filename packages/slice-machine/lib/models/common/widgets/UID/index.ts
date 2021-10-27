/* eslint-disable */

import * as yup from "yup";
import { MdVpnKey } from "react-icons/md";

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
import { DefaultFields } from "../../../../forms/defaults";
import { createValidationSchema } from "../../../../forms";
import { Widget } from "../Widget";
import { UIDField } from "./type";
import { FieldType } from "../../CustomType/fields";

const FormFields = {
  label: DefaultFields.label,
  id: {
    ...DefaultFields.id,
    validate: {
      required: "This field is required",
      matches: [/^uid$/, "Api ID must be 'uid' for this field."],
    },
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

export const UIDWidget: Widget<UIDField, typeof schema> = {
  create: (label: string) => new UIDField({ label }),
  Meta,
  schema,
  TYPE_NAME: FieldType.UID,
  FormFields,
};
