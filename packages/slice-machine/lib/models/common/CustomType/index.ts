import { Tab } from "./tab";
import { TabsAsArray, TabsAsObject } from "./tab";
import { SliceZoneAsArray } from './sliceZone'

export interface SeoTab {
  label: string;
  description: string;
}

export interface CustomTypeJsonModel {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  json: TabsAsObject;
}

export interface CustomType<T extends TabsAsArray | TabsAsObject> {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  tabs: T;
  previewUrl?: string;
}

export const CustomType = {
  toArray(ct: CustomType<TabsAsObject>): CustomType<TabsAsArray> {
    return {
      ...ct,
      tabs: Object.entries(ct.tabs).map(([key, value]) =>
        Tab.toArray(key, value)
      ),
    }
  },
  toObject(ct: CustomType<TabsAsArray>): CustomType<TabsAsObject> {
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
  toJsonModel(ct: CustomType<TabsAsObject>): CustomTypeJsonModel {
    const { tabs, previewUrl, ...rest } = ct
    return {
      ...rest,
      json: ct.tabs
    }
  },
  getSliceZones(ct: CustomType<TabsAsArray>): ReadonlyArray<SliceZoneAsArray | null> {
    return ct.tabs.map(t => t.sliceZone)
  }
};
