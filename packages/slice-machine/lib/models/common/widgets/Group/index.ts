import * as yup from 'yup'
import Form, { FormFields } from './Form'
import  { BsLink } from 'react-icons/bs'

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'
import CustomListItem from './ListItem'

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

const create = () => ([])

const Meta = {
  icon: BsLink,
  title: 'Group',
  description: 'A Group of Prismic widgets'
}

const schema = yup.object().shape({
  type: yup.string().matches(/^Group$/, { excludeEmptyString: true }).required(),
  fields: yup.object() // todo
})

/** Used only here to help generate a proper widget when config key is not "config" */
const customAccessor = 'fields'

export default {
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  Meta,
  FormFields,
  schema,
  Form,
  create,
  CustomListItem,
  customAccessor,
  TYPE_NAME: 'Group'
}

export interface Group extends yup.TypeOf<typeof schema> {}
