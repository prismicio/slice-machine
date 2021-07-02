import { Field } from '../CustomType/fields'
import { GroupField, AsArray, AsObject } from '../widgets/types'

// export type GroupField<AsArray> = ReadonlyArray<{key: string, value: Field }>

// export interface GroupField<AsArray> {
//   key: string,
//   type: string
//   value: {
//     label: string,
//     fields: GroupField<AsArray>
//   }
// }

export const Group = {
  addWidget(group: GroupField<AsArray>, newField: { key: string, value: Field }): GroupField<AsArray> {
    return {
      ...group,
      config: {
        ...group.config,
        fields: [...group.config.fields, newField]
      }
    }
  },
  deleteWidget(group: GroupField<AsArray>, wkey: string): GroupField<AsArray> {
    return {
      ...group,
      config: {
        ...group.config,
        fields: group.config.fields.filter(({ key }) => key !== wkey)
      }
    }
  },
  reorderWidget(group: GroupField<AsArray>, start: number, end: number): GroupField<AsArray> {
    const reorderedWidget: { key: string, value: Field } | undefined = group.config.fields[start]
    if(!reorderedWidget) throw new Error(`Unable to reorder the widget at index ${start}.`)

    const reorderedArea = group.config.fields.reduce<ReadonlyArray<{ key: string, value: Field }>>((acc, field, index) => {
      const elems = [field, reorderedWidget]
      switch(index) {
        case start: return acc
        case end: return [ ...acc, ...end > start ? elems : elems.reverse() ]
        default: return [ ...acc, field ]
      }
    }, [])

    return {
      ...group,
      config: {
        ...group.config,
        fields: reorderedArea
      }
    }
  },
  replaceWidget(group: GroupField<AsArray>, previousKey: string, newKey: string, value: Field): GroupField<AsArray> {
    return {
      ...group,
      config: {
        ...group.config,
        fields: group.config.fields.map(t => {
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
  toArray(group: GroupField<AsObject>): GroupField<AsArray> {
    return {
      ...group,
      config: {
        ...group.config,
        fields: Object.entries(group.config.fields).map(([key, value]) => ({ key, value }))
      }
    }
  },
  toObject(group: GroupField<AsArray>): GroupField<AsObject> {
    return {
      ...group,
      config: {
        ...group.config,
        fields: group.config.fields.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
      }
    }
  }
}
