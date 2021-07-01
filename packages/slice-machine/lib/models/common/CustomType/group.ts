import { FieldWidget } from '../widgets'
import { Group as GroupWidget } from '../widgets/Group'

export type GroupFieldsAsArray = ReadonlyArray<{key: string, value: FieldWidget }>

export interface GroupAsArray {
  key: string,
  type: string
  value: {
    label: string,
    fields: GroupFieldsAsArray
  }
}

export const Group = {
  addWidget(group: GroupAsArray, newField: { key: string, value: FieldWidget }): GroupAsArray {
    return {
      ...group,
      value: {
        ...group.value,
        fields: [...group.value.fields, newField]
      }
    }
  },
  deleteWidget(group: GroupAsArray, wkey: string): GroupAsArray {
    return {
      ...group,
      value: {
        ...group.value,
        fields: group.value.fields.filter(({ key }) => key !== wkey)
      }
    }
  },
  reorderWidget(group: GroupAsArray, start: number, end: number): GroupAsArray {
    const reorderedWidget: { key: string, value: FieldWidget } | undefined = group.value.fields[start]
    if(!reorderedWidget) throw new Error(`Unable to reorder the widget at index ${start}.`)

    const reorderedArea = group.value.fields.reduce<GroupFieldsAsArray>((acc, widget, index) => {
      const elems = [widget, reorderedWidget]
      switch(index) {
        case start: return acc
        case end: return [ ...acc, ...end > start ? elems : elems.reverse() ]
        default: return [ ...acc, widget ]
      }
    }, [])
    return {
      ...group,
      value: {
        ...group.value,
        fields: reorderedArea
      }
    }
  },
  replaceWidget(group: GroupAsArray, previousKey: string, newKey: string, value: FieldWidget): GroupAsArray {
    return {
      ...group,
      value: {
        ...group.value,
        fields: group.value.fields.map(t => {
          if (t.key === previousKey) {
            return {
              key: newKey,
              value
            }
          }
          return t
        })
      }
    }
  },
  toArray(key: string, group: GroupWidget): GroupAsArray {
    return {
      key,
      type: group.type,
      value: {
        ...group.config,
        fields: Object.entries(group.config.fields).map(([key, value]) => ({ key, value }))
      }
    }
  },
  toObject(group: GroupAsArray): GroupWidget {
    return {
      type: FieldType.Group,
      config: {
        placeholder: '',
        ...group.value,
        fields: group.value.fields.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
      }
    }
  }
}
