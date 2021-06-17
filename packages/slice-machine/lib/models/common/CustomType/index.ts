import { Tab } from "./tab";
import { TabsAsArray, TabsAsObject } from "./tab";
import { SliceZoneAsArray } from './sliceZone'

export interface SeoTab {
  label: string;
  description: string;
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
  getSliceZones(ct: CustomType<TabsAsArray>): ReadonlyArray<SliceZoneAsArray | null> {
    return ct.tabs.map(t => t.sliceZone)
  }
};
