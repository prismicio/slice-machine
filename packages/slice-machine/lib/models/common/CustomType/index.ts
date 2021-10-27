import { Tab, TabAsArray, TabAsObject } from "./tab";
import { SliceZone, SliceZoneAsArray } from "./sliceZone";
import { Field } from "./fields";

export type ObjectTabs = {
  [key: string]: TabAsObject;
};

export type ArrayTabs = ReadonlyArray<TabAsArray>;

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
      [fieldId: string]: Field | SliceZone;
    };
  };
}

export interface CustomType<T extends ObjectTabs | ArrayTabs> {
  id: string;
  status: boolean;
  repeatable: boolean;
  label: string;
  tabs: T;
  previewUrl?: string;
}

export const CustomType = {
  toArray(ct: CustomType<ObjectTabs>): CustomType<ArrayTabs> {
    return {
      ...ct,
      tabs: Object.entries(ct.tabs).map(([key, value]) =>
        Tab.toArray(key, value)
      ),
    };
  },
  toObject(ct: CustomType<ArrayTabs>): CustomType<ObjectTabs> {
    return {
      ...ct,
      tabs: ct.tabs.reduce((acc, tab) => {
        return {
          ...acc,
          [tab.key]: Tab.toObject(tab),
        };
      }, {}),
    };
  },
  toJsonModel(ct: CustomType<ObjectTabs>): CustomTypeJsonModel {
    const { tabs, previewUrl, ...rest } = ct; // eslint-disable-line
    return {
      ...rest,
      json: Object.entries(ct.tabs).reduce((acc, [key, tab]) => {
        return {
          ...acc,
          [key]: tab.value,
        };
      }, {}),
    };
  },
  fromJsonModel(key: string, ct: CustomTypeJsonModel): CustomType<ObjectTabs> {
    const { json, ...rest } = ct;
    return {
      ...rest,
      id: key,
      tabs: Object.entries(json).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: { key, value },
        };
      }, {}),
    };
  },
  getSliceZones(
    ct: CustomType<ArrayTabs>
  ): ReadonlyArray<SliceZoneAsArray | null> {
    return ct.tabs.map((t) => t.sliceZone);
  },
};
