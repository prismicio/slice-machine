import { Widget } from '../widgets'
import { SliceZone, SliceZoneAsArray } from './sliceZone'
import { FieldType } from './fields'
import { GroupAsArray, Group, GroupWidget, GroupFieldsAsArray } from './group'

export interface TabAsArray {
  key: string
  value: TabValueAsArray,
  sliceZone: SliceZoneAsArray | null
}

type TabAsArrayElement = {key: string, value: Widget} | GroupAsArray
export type TabValueAsArray = ReadonlyArray<TabAsArrayElement>

type TabContentObject = Widget | SliceZone | GroupWidget

export type TabsAsArray = ReadonlyArray<TabAsArray>

export interface TabAsObject {
  [fieldId: string]: TabContentObject
}

export interface TabsAsObject {
  [tabId: string]: TabAsObject
}

interface OrganisedFields {
  fields: ReadonlyArray<{key: string, value: Widget}>
  groups: ReadonlyArray<GroupAsArray>
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
  toArray(key: string, tab: TabAsObject): TabAsArray {
    const maybeSliceZone = Object.entries(tab).find(([, value]) => value.type === FieldType.SliceZone)
    return {
      key,
      value: Object.entries(tab).reduce((acc: TabValueAsArray, [fieldId, value]: [string, TabContentObject]) => {
        if (value.type === FieldType.SliceZone) {
          return acc
        }
        if (value.type === FieldType.Group) {
          return [...acc, Group.toArray(fieldId, value as GroupWidget) as GroupAsArray]
        }
        return [...acc, { key: fieldId, value: value as Widget }]
      }, []),
      sliceZone: maybeSliceZone ? SliceZone.toArray(maybeSliceZone[0], maybeSliceZone[1] as SliceZone) : null
    }
  },
  toObject(tab: TabAsArray): TabAsObject {
    const tabAsObject = tab.value.reduce<TabAsObject>((acc: TabAsObject, { key, value }: TabAsArrayElement) => {
      if (value.type === FieldType.Group) {
        const groupValue = value as { type: string, label: string, fields: GroupFieldsAsArray }      
        return {
          ...acc,
          [key]: Group.toObject({ key, value: { type: groupValue.type, fields: groupValue.fields } } as GroupAsArray)
        }
      } else {
        const fieldValue = value as Widget
        return {
          ...acc,
          [key]: fieldValue
        }
      }
    }, {})
    if (tab.sliceZone) {
      tabAsObject[tab.sliceZone.key] = SliceZone.toObject(tab.sliceZone)
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
  updateGroup(tab: TabAsArray, groupId: string): Function {
    return (mutate: (v: GroupAsArray) => TabAsArray) => {
      return {
        ...tab,
        value: tab.value.map(t => {
        if (t.key === groupId) {
            return mutate(t as GroupAsArray)
          }
          return t
        })
      }
    }
  },
  addWidget(tab: TabAsArray, id: string, widget: Widget | GroupWidget): TabAsArray {
    const elem: TabAsArrayElement =
      widget.type === FieldType.Group
      ? Group.toArray(id, widget as GroupWidget)
      : { key: id, value: widget } as {key: string, value: Widget}

    return {
      ...tab,
      value: [...tab.value, elem]
    }
  },
  replaceWidget(tab: TabAsArray, previousKey: string, newKey: string, value: Widget | GroupAsArray): TabAsArray {
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
    const reorderedWidget: {key: string, value: Widget} | GroupAsArray | undefined = tab.value[start]
    if(!reorderedWidget) throw new Error(`Unable to reorder the widget at index ${start}.`)

    const reorderedArea: TabValueAsArray = tab.value.reduce((acc: TabValueAsArray, widget: {key: string, value: Widget} | GroupAsArray, index: number) => {
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
    const { fields, groups }: OrganisedFields = tabAsArray.value.reduce<OrganisedFields>((acc: OrganisedFields, curr: TabAsArrayElement) => {
      if (curr.value.type === FieldType.Group) {
        const groupValue = curr as GroupAsArray
        return {
          ...acc,
          groups: [...acc.groups, groupValue]
        }
      } else {
        const fieldValue = curr as {key: string, value: Widget}
        return {
          ...acc,
          fields: [...acc.fields, fieldValue]
        }
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
