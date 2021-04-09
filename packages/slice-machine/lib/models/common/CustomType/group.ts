import { Widget } from '../widgets'
import { FieldType } from './fields'
// import { Group as GroupWidget } from '../widgets/Group'
// import { FieldType } from './fields'

export type GroupFieldsAsArray = ReadonlyArray<{key: string, value: Widget }>

export interface GroupWidget {
  type: string
  fields: {
    [key: string]: Widget
  }
}

export interface GroupAsArray {
  key: string,
  value: {
    type: string,
    fields: GroupFieldsAsArray
  }
}

export const Group = {
  toArray(key: string, group: GroupWidget): GroupAsArray {
    return {
      key,
      value: {
        ...group,
        fields: Object.entries(group.fields).map(([key, value]) => ({ key, value }))
      }
    }
  },
  toObject(group: GroupAsArray): GroupWidget {
    return {
      type: FieldType.Group,
      fields: group.value.fields.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
    }
  }
}
