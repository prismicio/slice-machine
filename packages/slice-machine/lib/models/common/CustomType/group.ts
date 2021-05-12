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
    const reorderedWidget: {key: string, value: Widget} | undefined = group.value.fields[start]
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
  replaceWidget(group: GroupAsArray, previousKey: string, newKey: string, value: Widget): GroupAsArray {
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
