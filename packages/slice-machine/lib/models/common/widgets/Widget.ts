import { IconType } from 'react-icons'
import { AnyObjectSchema } from 'yup'

import { FieldType, Field } from '../CustomType/fields'

export interface Widget<F extends Field, S extends AnyObjectSchema> {
  TYPE_NAME: FieldType,
  handleMockContent?: Function,
  handleMockConfig?: Function,
  MockConfigForm?: {
    (): JSX.Element;
    initialValues: any;
  },
  create: (label: string) => F,
  Meta: {
    icon: IconType,
    title: string,
    description: string
  },
  schema: S,
  FormFields: {}
  CUSTOM_NAME?: string
  CustomListItem?:(props: any) => React.ReactElement
  Form?:(props: any) => React.ReactElement
}

export type AnyWidget = Widget<any, any>