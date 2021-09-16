import { TabAsObject } from './tab'
import { SliceZone } from './sliceZone'
import { Field, FieldType } from './fields'
import { UIDField } from '../widgets/UID/type'
import { AsObject } from '../widgets/Group/type'
import { ObjectTabs } from './index'

function extractUidFromTab(value: AsObject): UIDField | null {
  return Object
    .entries(value)
    .reduce((f: UIDField | null, [_, field]: [string, Field | SliceZone]) => {
      return  field.type === FieldType.UID
        ? field as UIDField
        : f
    }, null)
}

export const UID = {
  extractUidFromTabs(tabs: ObjectTabs): UIDField | null {
    return Object
    .entries(tabs)
    .reduce((uid: UIDField | null, [_, tab]: [string, TabAsObject]) => {
      if (uid) return uid
      const uidField = extractUidFromTab(tab.value)
      return uidField || null
    }, null)
  },

  addUidToFirstTab(tabs: ObjectTabs, uid: UIDField): ObjectTabs {
    const firstTabName: string | undefined = Object.keys(tabs)[0]
    if (!firstTabName) throw new Error("Wrong custom type with no default tab.")

    const { [firstTabName]: firstTab, ...rest } = tabs
    
    const updatedFirstTab: TabAsObject = {
      key: firstTabName,
      value: {
        "uid": uid,
        ...firstTab.value
      }
    }

    return { [firstTabName]: updatedFirstTab, ...rest }
  }
}