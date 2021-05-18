import * as yup from 'yup'
import Form, { FormFields } from './Form'
import  { MdPlaylistAdd } from 'react-icons/md'

import CustomListItem from './ListItem'

const create = () => ({ label: '', placeholder: '', fields: {} })

const Meta = {
  icon: MdPlaylistAdd,
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

export const Group = {
  Meta,
  FormFields,
  schema,
  Form,
  create,
  CustomListItem,
  TYPE_NAME: 'Group'
}

export interface Group extends yup.TypeOf<typeof schema> {}
