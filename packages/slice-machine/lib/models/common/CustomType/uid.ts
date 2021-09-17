import { TabAsObject } from './tab'
import { SliceZone } from './sliceZone'
import { Field, FieldType } from './fields'
import { UIDField } from '../widgets/UID/type'
import { AsObject } from '../widgets/Group/type'
import { ObjectTabs } from './index'

interface UidExtractedFromTab {
  uid: UIDField | null,
  updatedTab: AsObject
}

function extractUidFromTab(value: AsObject): UidExtractedFromTab {
  return Object
    .entries(value)
    .reduce((acc: UidExtractedFromTab, [fieldId, field]: [string, Field | SliceZone]) => {
      if (field.type === FieldType.UID) {
        return {
          uid: field as UIDField,
          updatedTab: acc.updatedTab
        }
      } else {
        return {
          uid: acc.uid,
          updatedTab: {
            ...acc.updatedTab,
            [fieldId]: field
          }
        }
      }
    }, { uid: null, updatedTab: {} })
}

interface UidExtractedFromTabs {
  uid: UIDField | null,
  updatedTabs: ObjectTabs
}

export const UID = {
  extractUidFromTabs(tabs: ObjectTabs): UidExtractedFromTabs {
    return Object
    .entries(tabs)
    .reduce((acc: UidExtractedFromTabs, [tabId, tab]: [string, TabAsObject]) => {
      const { uid, updatedTab: updatedValue } = extractUidFromTab(tab.value)

      return {
        uid: acc.uid || uid,
        updatedTabs: {
          ...acc.updatedTabs,
          [tabId]: {
            ...tab,
            value: updatedValue
          }
        }
      }
    }, { uid: null, updatedTabs: {}})
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