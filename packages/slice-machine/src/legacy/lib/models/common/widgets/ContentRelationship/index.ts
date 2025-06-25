import { Link } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdSettingsEthernet } from "react-icons/md";
import * as yup from "yup";

import { linkConfigSchema } from "../Link";
import { Widget } from "../Widget";
import Form, { FormFields } from "./Form";

/**
 * Legacy:
 *  {
 *   "type": "Link",
 *   "config": {
 *     "select": "document",
 *     "label": "relationship"
 *     "customtypes": [
 *       "page"
 *     ],
 *   }
 * }
 *
 * Current format (field picking):
 * {
 *   "type": "Link",
 *   "config": {
 *     "select": "document",
 *     "label": "relationship"
 *     "customtypes": [
 *       {
 *         "id": "page",
 *         "fields": [
 *           "category",
 *           {
 *             "id": "countryRelation",
 *             "customtypes": [
 *               {
 *                 "id": "country",
 *                 "fields": ["name"]
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ],
 *   }
 * }
 */

const Meta = {
  icon: MdSettingsEthernet,
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const contentRelationShipConfigSchema = linkConfigSchema.shape({
  label: yup.string().max(35, "String is too long. Max: 35"),
  select: yup
    .string()
    .required()
    .matches(/^document$/, { excludeEmptyString: true }),
  customtypes: yup.array().optional(),
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
  create: (label: string): Link => ({
    type: "Link",
    config: {
      label,
      select: "document",
      repeat: false,
      customtypes: [],
    },
  }),
  Meta,
  schema,
  TYPE_NAME: "Link",
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
  prepareInitialValues: (customTypes, initialValues) => {
    if (!initialValues?.customtypes) {
      return initialValues;
    }

    return {
      ...initialValues,
      customtypes: initialValues.customtypes.filter((ct) =>
        customTypes.find((frontendCustomType) => {
          if (typeof ct === "string") {
            return frontendCustomType.local.id === ct;
          }
          return frontendCustomType.local.id === ct.id;
        }),
      ),
    };
  },
};
