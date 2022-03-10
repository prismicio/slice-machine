import { Reducer } from "redux";
import { CustomTypeStoreType } from "./types";
import {
  getType,
} from "typesafe-actions";
import { createTabCreator, updateTabCreator, CustomTypeActions, initCustomTypeStoreCreator } from "./actions";
import { Tab } from "@models/common/CustomType/tab";
import { deleteTabCreator} from "@src/models/customType/newActions";

// Selectors

// Reducer
export const customTypeReducer: Reducer<
  CustomTypeStoreType,
  CustomTypeActions
> = (state = null, action) => {
  switch (action.type) {
    case getType(initCustomTypeStoreCreator):
      return {
        ...state,
        model: action.payload.model,
        mockConfig: action.payload.mockConfig
      };
    case getType(createTabCreator):
      if (!state) return;
      const { tabId } = action.payload;
      if (state.model.tabs.find((e) => e.key === tabId)) {
        return state;
      }
      return {
        ...state,
        model: {
          ...state.model,
          tabs: [...state.model.tabs, Tab.init(tabId)],
        },
      };
    case getType(updateTabCreator): {
      if (!state) return;
      const { tabId, newTabId } = action.payload;
      if (newTabId === tabId) {
        return state;
      }
      return {
        ...state,
        model: {
          ...state.model,
          tabs: state.model.tabs.map((t) => {
            if (t.key === tabId) {
              return {
                ...t,
                key: newTabId,
              };
            }
            return t;
          }),
        },
      };
    }
    case getType(deleteTabCreator): {
      if (!state) return;
      const { tabId } = action.payload;
      const tabs = state.model.tabs.filter((tab) => tab.key !== tabId);
      return {
        ...state,
        model: {
          ...state.model,
          tabs,
        }
      };
    }
    default:
      return state;
  }
};