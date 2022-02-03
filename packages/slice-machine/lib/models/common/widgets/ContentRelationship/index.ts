import * as yup from "yup";
import Form, { FormFields } from "./Form";

import { MdSettingsEthernet } from "react-icons/md";

import { Widget } from "../Widget";
import { FieldType } from "../../CustomType/fields";
import { ContentRelationshipField } from "./type";
import { linkConfigSchema } from "../Link";

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const contentRelationShipConfigSchema = linkConfigSchema.shape({
  label: yup.string().max(35, "String is too long. Max: 35"),
  select: yup
    .string()
    .required()
    .matches(/^document$/, { excludeEmptyString: true }),
  customtypes: yup.array(yup.string()).strict().optional(),
});

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Link$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  config: contentRelationShipConfigSchema,
});

export const ContentRelationshipWidget: Widget<
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
