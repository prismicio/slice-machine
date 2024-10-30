import { Link } from "@prismicio/types-internal/lib/customtypes";
import { MdLink } from "react-icons/md";
import * as yup from "yup";

import { Widget } from "../Widget";
import Form, { FormFields } from "./Form";

/**
* {
    "type": "Link",
    "config": {
      "label": "link",
      "placeholder": "Could be a link to use case, press article, signup...",
      "allowTargetBlank": true,
      "allowText": true
      "repeat": true,
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
      "placeholder": "dsfdsfsdf",
      "allowText": true,
      "repeat": true,
    }
  }
  */

/**{
    "type" : "Link",
    "config" : {
      "select" : "media",
      "label" : "tomedia",
      "placeholder" : "qsdqsdqsd",
      "allowText": true,
      "repeat": true,
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
  icon: MdLink,
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
    allowText: yup.boolean().strict().optional(),
    repeat: yup.boolean().strict().optional(),
  })
  .required()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  .default(undefined)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      allowTargetBlank: true,
      allowText: true,
      repeat: false,
    },
  }),
  TYPE_NAME: "Link",
};
