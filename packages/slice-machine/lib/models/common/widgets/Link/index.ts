import * as yup from 'yup'
import Form, { FormFields } from './Form'
import  { BsLink } from 'react-icons/bs'

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

import { Widget } from '../Widget'
import { FieldType } from '../../CustomType/fields'

import { LinkField } from './type'

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
  icon: BsLink,
  title: 'Link',
  description: 'A link to web, media or Prismic document'
}

const linkConfigSchema = yup.object().shape({
  label: yup.string().optional(),
  useAsTitle: yup.boolean().optional(),
  placeholder: yup.string().optional(),
  select: yup.string().optional().oneOf(['media', 'document', 'web']).nullable(true),
  customtypes: yup.array(yup.string()).strict().optional(),
  masks: yup.array(yup.string()).optional(),
  tags: yup.array(yup.string()).optional(),
  allowTargetBlank: yup.boolean().strict().optional()
}).required().default(undefined).noUnknown(true)

const schema = yup.object().shape({
  type: yup.string().matches(/^Link$/, { excludeEmptyString: true }).required(),
  config: linkConfigSchema.optional()
})

export const Link: Widget<LinkField, typeof schema> = {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  Meta,
  FormFields,
  schema,
  Form,
  create: (label: string) => new LinkField({ label }),
  TYPE_NAME: FieldType.Link
}

