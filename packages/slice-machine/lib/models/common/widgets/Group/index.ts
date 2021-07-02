import * as yup from 'yup'
import Form, { FormFields } from './Form'
import  { MdPlaylistAdd } from 'react-icons/md'

import { FieldType } from '../../CustomType/fields'
import { Widget } from '../Widget'

import CustomListItem from './ListItem'
import { AsArray, GroupField } from '../types'

const Meta = {
  icon: MdPlaylistAdd,
  title: 'Group',
  description: 'A Group of Prismic widgets'
}

const schema = yup.object().shape({
  type: yup.string().matches(/^Group$/, { excludeEmptyString: true }).required(),
  config: yup.object().shape({
    fields: yup.array(),
    label: yup.string(),
    placeholder: yup.string()
  })
})

export const Group: Widget<GroupField<AsArray>, typeof schema> = {
  Meta,
  FormFields,
  schema,
  Form,
  create: () => new GroupField({ label: '', placeholder: '', fields: [] }),
  CustomListItem,
  TYPE_NAME: FieldType.Group
}