import * as yup from "yup";
import { MdVpnKey } from "react-icons/md";
// import { MockConfigForm } from './Mock/Form'
// import { handleMockConfig, handleMockContent } from './Mock'

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
import { UIDField } from "../types";
import { FieldType } from "../../CustomType/fields";

const FormFields = DefaultFields;

const schema = yup.object().shape({
  type: yup.string().matches(/^UID$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: MdVpnKey,
  title: "UID",
  description: "Unique Identifier",
};

export const UID: Widget<UIDField, typeof schema> = {
  create: () => new UIDField(),
  Meta,
  schema,
  TYPE_NAME: FieldType.UID,
  FormFields,
};
