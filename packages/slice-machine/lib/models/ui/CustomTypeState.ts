import { ArrayTabs, CustomType } from "../common/CustomType";
import { Field } from "../common/CustomType/fields";
import { TabAsArray } from "../common/CustomType/tab";

export enum CustomTypeStatus {
  New = "NEW_CT",
  Modified = "MODIFIED",
  Synced = "SYNCED",
}

type PoolOfFields = ReadonlyArray<{ key: string; value: Field }>;

export interface CustomTypeState {
  current: CustomType<ArrayTabs>;
  initialCustomType: CustomType<ArrayTabs>;
  remoteCustomType: CustomType<ArrayTabs> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMockConfig: any;
  poolOfFieldsToCheck: PoolOfFields;
  isTouched?: boolean;
  __status?: CustomTypeStatus;
}

export const CustomTypeState = {
  tab(state: CustomTypeState, tabId?: string): TabAsArray | undefined {
    if (state.current.tabs.length) {
      if (tabId) return state.current.tabs.find((v) => v.key === tabId);
      return state.current.tabs[0];
    }
  },

  updateTab(state: CustomTypeState, tabId: string) {
    return (mutate: (v: TabAsArray) => TabAsArray): CustomTypeState => {
      const tabs = state.current.tabs.map((v) => {
        if (v.key === tabId) return mutate(v);
        else return v;
      });

      return {
        ...state,
        current: {
          ...state.current,
          tabs,
        },
      };
    };
  },
  deleteTab(state: CustomTypeState, tabId: string): CustomTypeState {
    const tabs = state.current.tabs.filter((v) => v.key !== tabId);
    return {
      ...state,
      current: {
        ...state.current,
        tabs,
      },
    };
  },
  getPool(tabs: ArrayTabs): PoolOfFields {
    return tabs.reduce<PoolOfFields>((acc: PoolOfFields, curr: TabAsArray) => {
      return [...acc, ...curr.value];
    }, []);
  },
};
