import { Tab, TabAsArray, TabAsObject } from './tab'
import { SliceZone, SliceZoneAsArray } from './sliceZone'
import { Field } from './fields'
import { UIDField } from '../widgets/UID/type'
import { UID } from './uid'

export type ObjectTabs = {
  [key: string]: TabAsObject
}

export type ArrayTabs = ReadonlyArray<TabAsArray>

export interface SeoTab {
  label: string;
  description: string;
}

export interface CustomTypeJsonModel {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  json: {
    [key: string]: {
      [fieldId: string]: Field | SliceZone
    }
  }
};

export interface CustomType<T extends ObjectTabs | ArrayTabs> {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  tabs: T;
  uid?: UIDField;
  previewUrl?: string;
}

export const CustomType = {
  toArray(ct: CustomType<ObjectTabs>): CustomType<ArrayTabs> {
    const { uid, updatedTabs } = UID.extractUidFromTabs(ct.tabs)

    return {
      ...ct,
      ... uid ? { uid } : {},
      tabs: Object.entries(updatedTabs).map(([key, value]) => Tab.toArray(key, value)),
    }
  },
  toObject(ct: CustomType<ArrayTabs>): CustomType<ObjectTabs> {
    const { tabs, uid, ...rest } = ct

    const objectTabs: ObjectTabs =
      ct
      .tabs
      .reduce((acc, tab) => {
        return {
          ...acc,
          [tab.key]: Tab.toObject(tab)
        }
      }, {})

    const updatedTabs = uid
      ? UID.addUidToFirstTab(objectTabs, uid)
      : objectTabs

    return {
      ...rest,
      tabs: updatedTabs
    }
  },
  toJsonModel(ct: CustomType<ObjectTabs>): CustomTypeJsonModel {
    const { tabs, previewUrl, uid, ...rest } = ct

    const updatedTabs = uid
      ? UID.addUidToFirstTab(tabs, uid)
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

    const tabs: ObjectTabs = Object.entries(json).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: { key, value }
      }
    }, {})

    const { uid, updatedTabs } = UID.extractUidFromTabs(tabs)
    
    return {
      ...rest,
      id: key,
      tabs: updatedTabs,
      ... uid ? { uid } : {},
    }
  },
  getSliceZones(ct: CustomType<ArrayTabs>): ReadonlyArray<SliceZoneAsArray | null> {
    return ct.tabs.map(t => t.sliceZone)
  }
};
