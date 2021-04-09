import { Widget } from '../widgets'
import { SliceZone, SliceZoneAsArray } from './sliceZone'
import { FieldType } from './fields'
import { GroupAsArray, Group, GroupWidget } from './group'

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
  addWidget(tab: TabAsArray, id: string, widget: Widget | GroupWidget): TabAsArray {
    const elem: TabAsArrayElement =
      widget.type === "Group"
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
      switch(index) {
        case start: return acc
        case end: return [ ...acc, reorderedWidget, widget ]
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
  }
}
