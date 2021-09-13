import * as yup from 'yup'
import Form, { FormFields } from './Form'
import { MdAttachment } from "react-icons/md";

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget } from '../Widget'
import { FieldType } from '../../CustomType/fields'

import { LinkField, Media } from '../types'

/**
* {
    "type": "Link",
    "config": {
      "label": "link",
      "placeholder": "Could be a link to use case, press article, signup...",
      "select": "media"
    }
  }
 */

const Meta = {
  icon: MdAttachment,
  title: 'Link to media',
  description: 'A link to files, document and media'
}

const linkToMediaConfigSchema = yup.object().shape({
  label: yup.string().optional(),
  useAsTitle: yup.boolean().optional(),
  placeholder: yup.string().optional(),
  select: yup.string().required().oneOf(['media', 'document', 'web']),
  customtypes: yup.array(yup.string()).strict().optional(),
  masks: yup.array(yup.string()).optional(),
  tags: yup.array(yup.string()).optional(),
  allowTargetBlank: yup.boolean().strict().optional()
}).required().default(undefined).noUnknown(true)

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

