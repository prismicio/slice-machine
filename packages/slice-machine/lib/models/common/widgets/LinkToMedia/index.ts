import * as yup from "yup";
import { MdAttachment } from "react-icons/md";

import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { FieldType } from "../../CustomType/fields";

import { linkConfigSchema } from "@lib/models/common/widgets/Link";
import Form, { FormFields } from "@lib/models/common/widgets/Link/Form";
import { LinkToMediaField } from "@lib/models/common/widgets/LinkToMedia/type";

const Meta = {
  icon: MdAttachment,
  title: "Link to media",
  description: "A link to files, document and media",
};

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
  config: linkToMediaConfigSchema.optional(),
});

export const LinkToMediaWidget: Widget<LinkToMediaField, typeof schema> = {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  Meta,
  FormFields,
  schema,
  Form,
  create: (label: string) => new LinkToMediaField({ label }),
  TYPE_NAME: FieldType.Link,
  CUSTOM_NAME: "LinkToMedia",
};
