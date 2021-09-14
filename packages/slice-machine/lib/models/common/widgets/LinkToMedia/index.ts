import * as yup from 'yup'
import Form, { FormFields } from './Form'
import { MdAttachment } from "react-icons/md";

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget } from '../Widget'
import { FieldType } from '../../CustomType/fields'

import { LinkField, Media } from '../types'
import { linkConfigSchema } from "@models/common/widgets/Link";

const Meta = {
  icon: MdAttachment,
  title: 'Link to media',
  description: 'A link to files, document and media'
}

const linkToMediaConfigSchema = linkConfigSchema.shape({
  select: yup.string().required().matches(/^media$/, { excludeEmptyString: true }),
})

const schema = yup.object().shape({
  type: yup.string().matches(/^Link$/, { excludeEmptyString: true }).required(),
  config: linkToMediaConfigSchema.optional()
})

export const LinkToMedia: Widget<LinkField, typeof schema> = {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  Meta,
  FormFields,
  schema,
  Form,
  create: () => new LinkField({ label: '', placeholder: '', select: Media.media, allowTargetBlank: false }),
  TYPE_NAME: FieldType.Link,
  CUSTOM_NAME: 'LinkToMedia',
}
