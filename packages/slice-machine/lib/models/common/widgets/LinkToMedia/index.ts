import * as yup from "yup";
import { MdAttachment } from "react-icons/md";

import { Widget } from "../Widget";

import { linkConfigSchema } from "@lib/models/common/widgets/Link";
import Form, { FormFields } from "./Form";
import { Link } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

const Meta = {
  icon: MdAttachment,
  title: "Link to media",
  description: "A link to files, document and media",
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const linkToMediaConfigSchema = linkConfigSchema.shape({
  select: yup
    .string()
    .required()
    .matches(/^media$/, { excludeEmptyString: true }),
});

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Link$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  config: linkToMediaConfigSchema.optional(),
});

export const LinkToMediaWidget: Widget<Link, typeof schema> = {
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
      select: "media",
    },
  }),
  TYPE_NAME: "Link",
  CUSTOM_NAME: "LinkToMedia",
};
