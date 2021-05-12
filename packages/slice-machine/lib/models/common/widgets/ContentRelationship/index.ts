import * as yup from "yup";
import Form, { FormFields } from "./Form";
import { DefaultFields } from "lib/forms/defaults";

import { MdSettingsEthernet } from "react-icons/md";

import { createInitialValues } from "../../../../forms";

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

const TYPE_NAME = "Link";

const Meta = {
  icon: MdSettingsEthernet,
  title: "Content Relationship",
  description: "Define content relations & internal links",
};

const create = (apiId: string) => ({
  ...createInitialValues({
    label: DefaultFields.label,
  }),
  select: "document",
  customtypes: [],
  id: apiId,
});

const configSchema = yup.object().shape({
  select: yup.string().matches(/document/),
  customtypes: yup.array(yup.string()).optional(),
});

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Link$/, { excludeEmptyString: true })
    .required(),
  label: yup.string().optional(),
  config: configSchema,
});

export const ContentRelationship = {
  create,
  Meta,
  schema,
  TYPE_NAME,
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
};

export interface ContentRelationship extends yup.TypeOf<typeof schema> {}
