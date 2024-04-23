import * as yup from "yup";
import Form, { FormFields } from "./Form";
import { FiLink2 } from "react-icons/fi";

import { Widget } from "../Widget";
import { Link } from "@prismicio/types-internal/lib/customtypes";

/**
* {
     "type": "Link",
    "config": {
      "label": "link",
      "placeholder": "Could be a link to use case, press article, signup...",
      "allowTargetBlank": true
    }
  }
 */

/**
  *{
    "type": "Link",
    "config": {
      "select": "document",
      "customtypes": ["homepage"],
      "label": "contentrrrrr",
      "placeholder": "dsfdsfsdf"
    }
  }
  */

/**{
    "type" : "Link",
    "config" : {
      "select" : "media",
      "label" : "tomedia",
      "placeholder" : "qsdqsdqsd"
    }
  } */

/** should handle content relationship and media
  *
  *{
    id: "Xt9fSxEAACIAFHz7"
    type: "homepage"
    tags: []
    slug: "homepage"
    lang: "en-us"
    link_type: "Document"
    isBroken: false
  }
  */

const Meta = {
  icon: FiLink2,
  title: "Link",
  description: "A link to web, media or Prismic document",
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
export const linkConfigSchema = yup
  .object()
  .shape({
    label: yup.string().optional(),
    useAsTitle: yup.boolean().optional(),
    placeholder: yup.string().optional(),
    select: yup
      .string()
      .optional()
      .oneOf(["media", "document", "web", null])
      .nullable(),
    customtypes: yup.array(yup.string()).strict().optional(),
    masks: yup.array(yup.string()).optional(),
    tags: yup.array(yup.string()).optional(),
    allowTargetBlank: yup.boolean().strict().optional(),
  })
  .required()
  .default(undefined)
  .noUnknown(true);

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Link$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  config: linkConfigSchema.optional(),
});

export const LinkWidget: Widget<Link, typeof schema> = {
  Meta,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields,
  schema,
  Form,
  create: (label: string) => ({
    type: "Link",
    config: {
      label,
      placeholder: "",
      select: null,
    },
  }),
  TYPE_NAME: "Link",
};
