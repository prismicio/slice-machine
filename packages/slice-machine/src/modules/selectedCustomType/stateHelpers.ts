import { TabSM } from "@prismic-beta/slicemachine-core/build/models/CustomType";
import { SelectedCustomTypeStoreType } from "@src/modules/selectedCustomType/types";

const updateTab =
  (state: SelectedCustomTypeStoreType, tabId: string) =>
  (mutate: (v: TabSM) => TabSM): SelectedCustomTypeStoreType => {
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
  state: SelectedCustomTypeStoreType,
  tabId: string
): SelectedCustomTypeStoreType => {
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

export default {
  deleteTab,
  updateTab,
};
