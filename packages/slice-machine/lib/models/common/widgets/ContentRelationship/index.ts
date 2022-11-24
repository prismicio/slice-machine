import * as yup from "yup";
import Form, { FormFields } from "./Form";

import { MdSettingsEthernet } from "react-icons/md";

import { Widget } from "../Widget";
import { linkConfigSchema } from "../Link";
import { Link } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { useSelector } from "react-redux";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";

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

export const ContentRelationshipWidget: Widget<Link, typeof schema> = {
  create: (label: string) => ({
    type: WidgetTypes.Link,
    config: {
      label,
      select: "document",
    },
  }),
  Meta,
  schema,
  TYPE_NAME: WidgetTypes.Link,
  FormFields,
  CUSTOM_NAME: "ContentRelationship",
  Form,
  prepareInitialValues: (initialValues) => {
    const customTypes = useSelector(selectAllCustomTypes);

    if (!initialValues?.customtypes) {
      return initialValues;
    }

    return {
      ...initialValues,
      customtypes: initialValues.customtypes.filter((ct) =>
        customTypes.find(
          (frontendCustomType) => frontendCustomType.local.id === ct
        )
      ),
    };
  },
};
