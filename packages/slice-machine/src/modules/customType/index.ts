import { Reducer } from "redux";
import { CustomTypeStoreType } from "./types";
import {
  getType,
} from "typesafe-actions";
import { createTabCreator, updateTabCreator, CustomTypeActions, initCustomTypeStoreCreator, addFieldCreator, deleteTabCreator } from "./actions";
import { Tab } from "@models/common/CustomType/tab";
import {sliceZoneType} from "@models/common/CustomType/sliceZone";
import {AnyWidget} from "@models/common/widgets/Widget";
import * as Widgets from "@models/common/widgets/withGroup";
import StateHelpers from "./stateHelpers";
import {deleteFieldCreator, reorderFieldCreator, replaceFieldCreator} from "@src/models/customType/newActions";
import {CustomTypeState} from "@models/ui/CustomTypeState";

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
      return StateHelpers.deleteTab(state, tabId);
    }
    case getType(addFieldCreator): {
      const { tabId, field, fieldId } = action.payload;
      try {
        if (field.type !== sliceZoneType) {
          const CurrentWidget: AnyWidget = Widgets[field.type];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          CurrentWidget.schema.validateSync(field, { stripUnknown: false });
          return StateHelpers.updateTab(
            state,
            tabId
          )((tab) => Tab.addWidget(tab, fieldId, field));
        }
        return state;
      } catch (err) {
        console.error(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `[store/addWidget] Model is invalid for widget "${field.type}".\nFull error: ${err}`
        );
        return state;
      }
    }
    case getType(deleteFieldCreator): {
      const { tabId, fieldId } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) => Tab.removeWidget(tab, fieldId));
    }
    case getType(replaceFieldCreator): {
      const { tabId, previousFieldId, newFieldId, value } = action.payload;
      try {
        if (value.type !== sliceZoneType) {
          const CurrentWidget: AnyWidget = Widgets[value.type];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          CurrentWidget.schema.validateSync(value, { stripUnknown: false });
          return StateHelpers.updateTab(
            state,
            tabId
          )((tab) =>
            Tab.replaceWidget(tab, previousFieldId, newFieldId, value)
          );
        }
        return state;
      } catch (err) {
        return state;
      }
    }
    case getType(reorderFieldCreator): {
      const { tabId, start, end } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) => Tab.reorderWidget(tab, start, end));
    }
    default:
      return state;
  }
};