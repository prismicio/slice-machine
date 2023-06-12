import * as yup from "yup";
import Form, { FormFields } from "./Form";

import { MdSettingsEthernet } from "react-icons/md";

import { Widget } from "../Widget";
import { linkConfigSchema } from "../Link";
import { Link } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

import CustomListItem from "./ListItem";

/**
 * {
      "type": "Link",
      "config": {
        "select": "document",
        "customtypes": [
          { customTypeId: "page" }
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
  customtypes: yup
    .array()
    .of(
      yup.object().shape({
        customTypeId: yup.string().required(),
        fetchFields: yup.boolean().optional(),
      })
    ).required().min(1, "Select at least 1 custom type"),
});

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Link$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  config: contentRelationShipConfigSchema,
});

export const ContentRelationshipWidget: Widget<Link, typeof schema> = {
  create: (label: string) => ({
    type: "Link",
    config: {
      label,
      select: "document",
    },
  }),
  Meta,
  schema,
  TYPE_NAME: "Link",
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
  CustomListItem,
};
