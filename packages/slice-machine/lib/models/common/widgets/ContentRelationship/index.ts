import * as yup from "yup";
import Form, { FormFields } from "./Form";
import { DefaultFields } from "lib/forms/defaults";

import { MdSettingsEthernet } from "react-icons/md";

import { createInitialValues } from "../../../../forms";

import { Widget } from '../Widget'
import { FieldType } from "../../CustomType/fields";

/**
 * {
      "type": "Link",
      "config": {
        "select": "document",
        "customtypes": [
          "page"
        ],
        "label": "relationship"
      }
    }
*/

const Meta = {
  icon: MdSettingsEthernet,
  title: "Content Relationship",
  description: "Define content relations & internal links",
};

const create = () => ({
  ...createInitialValues({
    label: DefaultFields.label,
  }),
  select: "document",
  customtypes: [],
});

const configSchema = yup.object().shape({
  label: yup.string().required(),
  select: yup.string().matches(/document/),
  customtypes: yup.array(yup.string()).optional(),
});

const schema = yup.object().shape({
  type: yup.string().matches(/^Link$/, { excludeEmptyString: true }).required(),
  config: configSchema,
});

export const ContentRelationship: Widget = {
  create,
  Meta,
  schema,
  TYPE_NAME: FieldType.ContentRelationship,
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
}

