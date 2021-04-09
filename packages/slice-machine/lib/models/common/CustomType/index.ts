import { Tab } from './tab'
import { TabsAsArray, TabsAsObject } from './tab'

export interface SeoTab {
  title: string
  description: string
}

export interface CustomType<T extends TabsAsArray | TabsAsObject> {
  id: string
  repeatable: boolean,
  title: string,
  tabs: T
}

export const CustomType = {
  toArray(ct: CustomType<TabsAsObject>): CustomType<TabsAsArray> {
    return {
      ...ct,
      tabs: Object.entries(ct.tabs).map(([key, value]) => Tab.toArray(key, value)),
    }
  },
  // toObject(ct: CustomType<TabsAsArray>): CustomType<TabsAsObject> {
  //   return {
  //     ...ct,
  //     tabs: ct.tabs.reduce((acc, { key, value: fields }) => {
  //       console.log({ fields })
  //       return {
  //         ...acc,
  //         [key]: (fields as any).reduce((acc, { key: fieldId, value }) => {
  //           console.log(fieldId, is<Group<GroupFieldsAsArray>>(value))
  //           return {
  //             ...acc,
  //             [fieldId]: value
  //             // : is<Group<GroupFieldsAsArray>>(value)
  //             // ? { ...value, fields: fieldsToObject(value.fields) } as GroupFieldsAsObject
  //             // : value
  //           }             
  //         }, {})
  //       }
  //     }, {})
  //   }
  // }
}