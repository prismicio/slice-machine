import * as yup from "yup";
import Form, { FormFields } from "./Form";

import { MdSettingsEthernet } from "react-icons/md";

import { Widget } from "../Widget";
import { FieldType } from "../../CustomType/fields";
import { ContentRelationshipField } from "./type";

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

const configSchema = yup
  .object()
  .shape({
    label: yup.string().max(35, "String is too long. Max: 35"),
    select: yup.string().matches(/^document$/),
    customtypes: yup.array(yup.string()).strict().optional(),
  })
  .required()
  .default(undefined)
  .noUnknown(true);

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Link$/, { excludeEmptyString: true })
    .required(),
  config: configSchema,
});

export const ContentRelationship: Widget<
  ContentRelationshipField,
  typeof schema
> = {
  create: (label: string) => new ContentRelationshipField({ label }),
  Meta,
  schema,
  TYPE_NAME: FieldType.ContentRelationship,
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
};
