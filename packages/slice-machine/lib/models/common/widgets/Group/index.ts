import * as yup from 'yup'
import Form, { FormFields } from './Form'
import  { BsLink } from 'react-icons/bs'

import CustomListItem from './ListItem'

const create = () => ({ label: '', placeholder: '', fields: {} })

const Meta = {
  icon: BsLink,
  title: 'Group',
  description: 'A Group of Prismic widgets'
}

const schema = yup.object().shape({
  type: yup.string().matches(/^Group$/, { excludeEmptyString: true }).required(),
  config: yup.object().shape({
    fields: yup.object(),
    label: yup.string(),
    placeholder: yup.string()
  })
})

/** Used only here to help generate a proper widget when config key is not "config" */
const customAccessor = 'fields'

export const Group = {
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
