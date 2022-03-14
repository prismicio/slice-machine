import { TabAsArray } from "@models/common/CustomType/tab";
import {
  CustomTypeStoreType,
  PoolOfFields,
} from "@src/modules/customType/types";
import { ArrayTabs } from "@models/common/CustomType";

const updateTab =
  (state: CustomTypeStoreType, tabId: string) =>
  (mutate: (v: TabAsArray) => TabAsArray): CustomTypeStoreType => {
    if (!state) return state;

    const tabs = state.model.tabs.map((tab) => {
      if (tab.key === tabId) return mutate(tab);
      else return tab;
    });

    return {
      ...state,
      model: {
        ...state.model,
        tabs,
      },
    };
  };

const deleteTab = (
  state: CustomTypeStoreType,
  tabId: string
): CustomTypeStoreType => {
  if (!state) return state;
  const tabs = state.model.tabs.filter((v) => v.key !== tabId);

  return {
    ...state,
    model: {
      ...state.model,
      tabs,
    },
  };
};

const getPool = (tabs: ArrayTabs): PoolOfFields => {
  return tabs.reduce<PoolOfFields>((acc: PoolOfFields, curr: TabAsArray) => {
    return [...acc, ...curr.value];
  }, []);
};

export default {
  deleteTab,
  updateTab,
  getPool,
};
