import * as yup from 'yup'
import Form, { FormFields } from './Form'
import  { BsLink } from 'react-icons/bs'
import { createInitialValues } from '../../../../forms'

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'
import { removeProp } from '../../../../utils'
import { Widget, WidgetType } from '../Widget'

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

const create = () => ({
  ...createInitialValues(removeProp(FormFields, 'id')),
  allowTargetBlank: true,
})

const Meta = {
  icon: BsLink,
  title: 'Link',
  description: 'A link to web, media or Prismic document'
}

const linkConfigSchema = yup.object().shape({
  label: yup.string().optional(),
  useAsTitle: yup.boolean().optional(),
  placeholder: yup.string().optional(),
  select: yup.string().optional().oneOf(['media', 'document', 'web']),
  customtypes: yup.array(yup.string()).optional(),
  masks: yup.array(yup.string()).optional(),
  tags: yup.array(yup.string()).optional(),
  allowTargetBlank: yup.boolean().optional()
})

const schema = yup.object().shape({
  type: yup.string().matches(/^Link$/, { excludeEmptyString: true }).required(),
  config: linkConfigSchema.optional()
})

export const Link = {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  Meta,
  FormFields,
  schema,
  Form,
  create,
  TYPE_NAME: 'Link'
}

enum Media {
  media = 'media',
  document = 'document',
  web = 'web'
}

export interface Link extends Widget<FieldType.Link, {
  label: string,
  useAsTitle: boolean,
  placeholder: string,
  select: Media,
  customtypes: ReadonlyArray<string>,
  masks: ReadonlyArray<string>,
  tags: ReadonlyArray<string>,
  allowTargetBlank: boolean
}> {}
