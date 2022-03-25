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
import { DEFAULT_CONFIG, Widget } from "../Widget";
import {
  UID,
  WidgetTypes,
} from "@prismicio/types-internal/lib/customtypes/widgets";

const FormFields = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  label: DefaultFields.label,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  id: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    ...DefaultFields.id,
    validate: {
      required: "This field is required",
      matches: [/^uid$/, "Api ID must be 'uid' for this field."],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  placeholder: DefaultFields.placeholder,
};

const schema = yup.object().shape({
  type: yup.string().matches(/^UID$/, { excludeEmptyString: true }).required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: MdVpnKey,
  title: "UID",
  description: "Unique Identifier",
};

export const UIDWidget: Widget<UID, typeof schema> = {
  create: (label: string) => ({
    type: WidgetTypes.UID,
    config: { ...DEFAULT_CONFIG, label },
  }),
  Meta,
  schema,
  TYPE_NAME: WidgetTypes.UID,
  FormFields,
};
