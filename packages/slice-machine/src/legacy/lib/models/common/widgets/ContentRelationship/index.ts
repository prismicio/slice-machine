import { Link } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdSettingsEthernet } from "react-icons/md";
import { useSelector } from "react-redux";
import * as yup from "yup";

import { hasLocal } from "@/legacy/lib/models/common/ModelData";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

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

const customTypesSchema = yup.object({
  id: yup.string().required(),
  customtypes: yup
    .array(
      yup.object({
        id: yup.string().required(),
        fields: yup
          .array(
            yup.lazy((fieldValue) => {
              if (typeof fieldValue === "string") {
                return yup.string();
              }

              return yup.object({
                id: yup.string().required(),
                fields: yup.array(yup.string()).required(),
              });
            }),
          )
          .required(),
      }),
    )
    .required(),
});
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const contentRelationShipConfigSchema = linkConfigSchema.shape({
  label: yup.string().max(35, "String is too long. Max: 35"),
  select: yup
    .string()
    .required()
    .matches(/^document$/, { excludeEmptyString: true }),
  // TODO: Validate customtypes using existing types-internal codec
  customtypes: yup
    .array(
      yup.object({
        id: yup.string().required(),
        fields: yup.array(
          yup.lazy((value) => {
            if (typeof value === "string") {
              return yup.string().required();
            }

            if ("fields" in value) {
              return yup.object({
                id: yup.string().required(),
                fields: yup
                  .array(
                    yup.lazy((fieldValue) => {
                      if (typeof fieldValue === "string") {
                        return yup.string().required();
                      }

                      return customTypesSchema;
                    }),
                  )
                  .required(),
              });
            }

            return customTypesSchema;
          }),
        ),
      }),
    )
    .optional(),
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
      repeat: false,
    },
  }),
  Meta,
  schema,
  TYPE_NAME: "Link",
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
  prepareInitialValues: (initialValues) => {
    const customTypes =
      // TODO: fix this error
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSelector(selectAllCustomTypes).filter(hasLocal);

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
