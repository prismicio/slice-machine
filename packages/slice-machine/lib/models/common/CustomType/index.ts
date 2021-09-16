import { Tab, TabAsArray, TabAsObject } from './tab'
import { SliceZone, SliceZoneAsArray } from './sliceZone'
import { Field, FieldType } from './fields'
import { UIDField } from '../widgets/UID/type'
import { AsObject } from '../widgets/Group/type'

export type ObjectTabs = {
  [key: string]: TabAsObject
}

function isTabAsObject(obj: object): obj is TabAsObject {
  return 'key' in obj && 'value' in obj
} 

export type ArrayTabs = ReadonlyArray<TabAsArray>

export interface SeoTab {
  label: string;
  description: string;
}

interface CustomTypeJson {
  [key: string]: {
    [fieldId: string]: Field | SliceZone
  }
}
export interface CustomTypeJsonModel {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  json: CustomTypeJson
};
export interface CustomType<T extends ObjectTabs | ArrayTabs> {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  tabs: T;
  uid: UIDField | null;
  previewUrl?: string;
}

function extractUidFromTab(value: AsObject): UIDField | null {
  return Object
    .entries(value)
    .reduce((f: UIDField | null, [_, field]: [string, Field | SliceZone]) => {
      return  field.type === FieldType.UID
        ? field as UIDField
        : f
    }, null)
}

function extractUidFromTabs(ct: CustomType<ObjectTabs> | CustomTypeJson): UIDField | null {
  return Object
      .entries(ct.tabs)
      .reduce((uid: UIDField | null, [_, tab]: [string, TabAsObject | AsObject]) => {
        if (uid) return uid
        const uidField = extractUidFromTab(
          isTabAsObject(tab) ? tab.value : tab
        )
        return uidField || null
  }, null)
}

export const CustomType = {
  toArray(ct: CustomType<ObjectTabs>): CustomType<ArrayTabs> {
    const uid = extractUidFromTabs(ct)

    return {
      ...ct,
      uid,
      tabs: Object.entries(ct.tabs).map(([key, value]) => Tab.toArray(key, value)),
    }
  },
  toObject(ct: CustomType<ArrayTabs>): CustomType<ObjectTabs> {
    return {
      ...ct,
      tabs: ct.tabs.reduce((acc, tab) => {
        return {
          ...acc,
          [tab.key]: Tab.toObject(tab)
        }
      }, {}),
    }
  },
  toJsonModel(ct: CustomType<ObjectTabs>): CustomTypeJsonModel {
    const { tabs, previewUrl, uid, ...rest } = ct

    const updatedTabs = uid
      ? (() => {
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
        })()
      : tabs

    return {
      ...rest,
      json: Object.entries(updatedTabs).reduce((acc, [key, tab]) => {
        return {
          ...acc,
          [key]: tab.value
        }

      }, {})
    }
  },
  fromJsonModel(key: string, ct: CustomTypeJsonModel): CustomType<ObjectTabs> {
    const { json, ...rest } = ct
    const uid: UIDField | null = extractUidFromTabs(json)

    return {
      ...rest,
      id: key,
      uid: uid,
      tabs: Object.entries(json).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: { key, value }
        }
      }, {}),
    }
  },
  getSliceZones(ct: CustomType<ArrayTabs>): ReadonlyArray<SliceZoneAsArray | null> {
    return ct.tabs.map(t => t.sliceZone)
  }
};
