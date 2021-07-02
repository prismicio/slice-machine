import { SliceZone, SliceZoneAsArray } from './sliceZone'
import { Field, FieldType } from './fields'
import { Group } from './group'

import { AsArray, AsObject, GroupField } from '../widgets/types'

export interface TabAsObject {
  key: string
  value: AsObject | { [key: string]: SliceZone },
}

export interface TabAsArray {
  key: string
  value: AsArray,
  sliceZone: SliceZoneAsArray | null
}

// type TabAsArrayElement = { key: string, value: Field }
// export type TabValueAsArray = ReadonlyArray<TabAsArrayElement>

// type TabContentObject = Field | SliceZone

// export type TabsAsArray = ReadonlyArray<TabAsArray>

// export interface TabAsObject {
//   [fieldId: string]: TabContentObject
// }

// export interface TabsAsObject {
//   [tabId: string]: TabAsObject
// }

interface OrganisedFields {
  fields: ReadonlyArray<{key: string, value: Field }>
  groups: ReadonlyArray<GroupField<AsArray>>
  sliceZone?: SliceZone
}

// interface Choices {
//   [x: string]: { type: string }
// }
// const filterChoices = (choices: Choices) => {
//   return Object.entries(choices).reduce((acc, [key, value]) => {
//     if (value.type !== FieldType.SharedSlice) {
//       return acc
//     }
//     return {
//       ...acc,
//       [key]: value
//     }
//   }, {})
// }

export const Tab = {
  init(id: string) {
    return { key: id, value: [], sliceZone: null }
  },
  toArray(key: string, tab: TabAsObject): TabAsArray {
    const maybeSliceZone = Object.entries(tab).find(([, value]) => value.type === FieldType.SliceZone)
    return {
      key,
      value: Object.entries(tab).reduce((acc: AsArray, [fieldId, value]: [string, Field]) => {
        if (value.type === FieldType.SliceZone) {
          return acc
        }
        if (value.type === FieldType.Group) {
          return [...acc, { key: fieldId, value: Group.toArray(value as GroupField<AsObject>) }]
        }
        return [...acc, { key: fieldId, value }]
      }, []),
      sliceZone: maybeSliceZone ? SliceZone.toArray(maybeSliceZone[0], maybeSliceZone[1] as SliceZone) : null
    }
  },
  toObject(tab: TabAsArray): TabAsObject {
    const tabAsObject = tab.value.reduce<TabAsObject>((acc: TabAsObject, { key, value }: { key: string, value: Field }) => {
      if (value.type === FieldType.Group) {
        return {
          ...acc,
          [key]: Group.toObject(value as GroupField<AsArray>)
        }
      }
      return { ...acc, [key]: value }
    }, {} as TabAsObject)

    if (tab.sliceZone && tab.sliceZone.value?.length) {
      tabAsObject.value[tab.sliceZone.key] = SliceZone.toObject(tab.sliceZone)
    }
    return tabAsObject
  },
  updateSliceZone(tab: TabAsArray): Function {
    return (mutate: (v: SliceZoneAsArray) => TabAsArray) => {
      return {
        ...tab,
        sliceZone: mutate(tab.sliceZone as SliceZoneAsArray)
      }
    }
  },
  updateGroup(tab: TabAsArray, groupId: string) {
    return (mutate: (v: GroupField<AsArray>) => Field): TabAsArray => {
      return {
        ...tab,
        value: tab.value.map(field => {
          if (field.key === groupId) {
            return { key: groupId, value: mutate(field.value as GroupField<AsArray>) }
          }
          return field
        })
      }
    }
  },
  addWidget(tab: TabAsArray, id: string, widget: Field): TabAsArray {
    const elem =
      widget.type === FieldType.Group
      ? { key: id, value: Group.toArray(widget as GroupField<AsObject>) }
      : { key: id, value: widget } as {key: string, value: Field }

    return {
      ...tab,
      value: [...tab.value, elem]
    }
  },
  replaceWidget(tab: TabAsArray, previousKey: string, newKey: string, value: Field): TabAsArray {
    return {
      ...tab,
      value: tab.value.map(t => {
        if (t.key === previousKey) {
          return {
            key: newKey,
            value
          }
        }
        return t
      })
    }
  },
  reorderWidget(tab: TabAsArray, start: number, end: number): TabAsArray {
    type TabValue = { key: string, value: Field }
    const reorderedWidget: TabValue | undefined = tab.value[start]
    if(!reorderedWidget) throw new Error(`Unable to reorder the widget at index ${start}.`)

    const reorderedArea: AsArray = tab.value.reduce((acc: AsArray, widget: TabValue, index: number) => {
      const elems = [widget, reorderedWidget]
      switch(index) {
        case start: return acc
        case end: return [ ...acc, ...end > start ? elems : elems.reverse() ]
        default: return [ ...acc, widget ]
      }
    }, [])
    return {
      ...tab,
      value: reorderedArea
    }
  },
  removeWidget(tab: TabAsArray, id: string): TabAsArray {
    const newTab = {
      ...tab,
      value: tab.value.filter(e => e.key !== id)
    }
    return newTab
  },
  createSliceZone(tab: TabAsArray, key: string): TabAsArray {
    return {
      ...tab,
      sliceZone: SliceZone.toArray(key, SliceZone.createEmpty())
    }
  },
  deleteSliceZone(tab: TabAsArray): TabAsArray {
    return {
      ...tab,
      sliceZone: null
    }
  },

  // interface OrganisedFields {
  //   fields: ReadonlyArray<{key: string, value: Widget}>
  //   groups: ReadonlyArray<GroupAsArray>
  //   sliceZone?: SliceZone
  // }

  organiseFields(tab: TabAsObject) {
    const tabAsArray = Tab.toArray('', tab)
    const { fields, groups }: OrganisedFields = tabAsArray.value.reduce<OrganisedFields>((acc: OrganisedFields, curr: { key: string, value: Field | GroupField<AsObject> }) => {
      if (curr.value.type === FieldType.Group) {
        const GroupAsArray = Group.toArray(curr.value as GroupField<AsObject>)
        return {
          ...acc,
          groups: [...acc.groups, GroupAsArray]
        }
      }
      return {
        ...acc,
        fields: [...acc.fields, curr]
      }
    }, { fields: [], groups: [] })
    return {
      fields,
      groups,
      sliceZone: tabAsArray.sliceZone,
    }
  }
  
  // ,
  // filterNonSharedSlices(tab: any): TabAsObject | undefined {
  //   const newTab = Object.entries(tab).reduce((acc, [key, value]) => {
  //     if (value.type !== FieldType.SliceZone) {
  //       return {
  //         ...acc,
  //         [key]: value
  //       }
  //     }
  //     console.log('filter ', value)
  //     return {
  //       ...acc,
  //       [key]: {
  //         ...value,
  //         config: {
  //           ...value.config,
  //           choices: filterChoices(value.config.choices)
  //         }
  //       }
  //     }
  //   }, {})
  //   return newTab
  // }
}
