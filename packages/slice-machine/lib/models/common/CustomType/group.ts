import { Widget } from '../widgets'
import { FieldType } from './fields'
// import { Group as GroupWidget } from '../widgets/Group'
// import { FieldType } from './fields'

export type GroupFieldsAsArray = ReadonlyArray<{key: string, value: Widget }>

export interface GroupWidget {
  type: string
  config: {
    fields: {
      [key: string]: Widget
    }
    label: string
  }
}

export interface GroupAsArray {
  key: string,
  value: {
    type: string,
    label: string,
    fields: GroupFieldsAsArray
  }
}

export const Group = {
  addWidget(group: GroupAsArray, newField: {key: string, value: Widget }): GroupAsArray {
    console.log(group, newField)
    return {
      ...group,
      value: {
        ...group.value,
        fields: [...group.value.fields, newField]
      }
    }
  },
  toArray(key: string, group: GroupWidget): GroupAsArray {
    console.log({ key, group })
    return {
      key,
      value: {
        type: group.type,
        ...group.config,
        fields: Object.entries(group.config.fields).map(([key, value]) => ({ key, value }))
      }
    }
  },
  toObject(group: GroupAsArray): GroupWidget {
    return {
      type: FieldType.Group,
      config: {
        label: group.value.label,
        fields: group.value.fields.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
      }
    }
  }
}
