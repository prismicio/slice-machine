import { Reducer } from "redux";
import { SelectedCustomTypeStoreType } from "./types";
import { getType } from "typesafe-actions";
import {
  createTabCreator,
  updateTabCreator,
  SelectedCustomTypeActions,
  initCustomTypeStoreCreator,
  cleanupCustomTypeStoreCreator,
  addFieldCreator,
  deleteTabCreator,
  renameSelectedCustomTypeLabel,
  createSliceZoneCreator,
  deleteSliceZoneCreator,
  deleteFieldCreator,
  deleteSharedSliceCreator,
  reorderFieldCreator,
  replaceFieldCreator,
  replaceSharedSliceCreator,
  addFieldIntoGroupCreator,
  deleteFieldIntoGroupCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldIntoGroupCreator,
  saveCustomTypeCreator,
} from "./actions";
import { Tab } from "@models/common/CustomType/tab";
import { SliceZone } from "@models/common/CustomType/sliceZone";
import { AnyWidget } from "@models/common/widgets/Widget";
import * as Widgets from "@models/common/widgets/withGroup";
import StateHelpers from "./stateHelpers";
import { CustomType } from "@models/common/CustomType";
import { SlicesSM } from "@lib/models/common/Slices";
import { GroupSM } from "@lib/models/common/Group";
import { Group } from "@lib/models/common/CustomType/group";

// Reducer
export const selectedCustomTypeReducer: Reducer<
  SelectedCustomTypeStoreType,
  SelectedCustomTypeActions
> = (state = null, action) => {
  switch (action.type) {
    case getType(cleanupCustomTypeStoreCreator):
      return null;
    case getType(initCustomTypeStoreCreator):
      return {
        ...state,
        model: action.payload.model,
        initialModel: action.payload.model,
        remoteModel: action.payload.remoteModel,
      };
    case getType(saveCustomTypeCreator.success): {
      if (!state) return state;

      return {
        ...state,
        initialModel: state.model,
      };
    }
    case getType(createTabCreator):
      if (!state) return state;
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
      if (!state) return state;
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
    case getType(renameSelectedCustomTypeLabel): {
      if (!state) return state;
      return {
        ...state,
        model: {
          ...state.model,
          label: action.payload.newLabel,
        },
      };
    }
    case getType(deleteTabCreator): {
      if (!state) return state;
      const { tabId } = action.payload;
      return StateHelpers.deleteTab(state, tabId);
    }
    case getType(addFieldCreator): {
      const { tabId, field, fieldId } = action.payload;
      try {
        if (
          field.type === "Range" ||
          field.type === "IntegrationFields" ||
          field.type === "Separator"
        ) {
          throw new Error("Unsupported Field Type.");
        }
        const CurrentWidget: AnyWidget = Widgets[field.type];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        CurrentWidget.schema.validateSync(field, { stripUnknown: false });
        return StateHelpers.updateTab(
          state,
          tabId
        )((tab) => Tab.addWidget(tab, fieldId, field));
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
        if (
          value.type === "Range" ||
          value.type === "IntegrationFields" ||
          value.type === "Separator"
        ) {
          throw new Error("Unsupported Field Type.");
        }
        const CurrentWidget: AnyWidget = Widgets[value.type];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        CurrentWidget.schema.validateSync(value, { stripUnknown: false });
        return StateHelpers.updateTab(
          state,
          tabId
        )((tab) => Tab.replaceWidget(tab, previousFieldId, newFieldId, value));
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
    case getType(createSliceZoneCreator): {
      if (!state) return state;
      const { tabId } = action.payload;
      const tabIndex = state.model.tabs.findIndex((t) => t.key === tabId);

      if (tabIndex === -1) {
        console.error(`No tabId ${tabId} found in tabs`);
        return state;
      }

      const existingSliceZones = CustomType.getSliceZones(state.model).filter(
        (e) => e
      );
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) => {
        const i = findAvailableKey(tabIndex, existingSliceZones);
        return Tab.createSliceZone(tab, `slices${i !== 0 ? i.toString() : ""}`);
      });
    }
    case getType(deleteSliceZoneCreator): {
      if (!state) return state;
      const { tabId } = action.payload;
      const tabIndex = state.model.tabs.findIndex((t) => t.key === tabId);

      if (tabIndex === -1) {
        console.error(`No tabId ${tabId} found in tabs`);
        return state;
      }

      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) => {
        return Tab.deleteSliceZone(tab);
      });
    }
    case getType(replaceSharedSliceCreator): {
      const { tabId, sliceKeys, preserve } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        Tab.updateSliceZone(tab)((sliceZone: SlicesSM) =>
          SliceZone.replaceSharedSlice(sliceZone, sliceKeys, preserve)
        )
      );
    }
    case getType(deleteSharedSliceCreator): {
      const { tabId, sliceId } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        Tab.updateSliceZone(tab)((sliceZone: SlicesSM) =>
          SliceZone.removeSharedSlice(sliceZone, sliceId)
        )
      );
    }
    case getType(addFieldIntoGroupCreator): {
      const { tabId, groupId, fieldId, field } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) =>
        Tab.updateGroup(
          tab,
          groupId
        )((group: GroupSM) =>
          Group.addWidget(group, { key: fieldId, value: field })
        )
      );
    }
    case getType(replaceFieldIntoGroupCreator): {
      const { tabId, groupId, previousFieldId, newFieldId, value } =
        action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) =>
        Tab.updateGroup(
          tab,
          groupId
        )((group: GroupSM) =>
          Group.replaceWidget(group, previousFieldId, newFieldId, value)
        )
      );
    }
    case getType(deleteFieldIntoGroupCreator): {
      const { tabId, groupId, fieldId } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) =>
        Tab.updateGroup(
          tab,
          groupId
        )((group: GroupSM) => Group.deleteWidget(group, fieldId))
      );
    }
    case getType(reorderFieldIntoGroupCreator): {
      const { tabId, groupId, start, end } = action.payload;
      return StateHelpers.updateTab(
        state,
        tabId
      )((tab) =>
        Tab.updateGroup(
          tab,
          groupId
        )((group: GroupSM) => Group.reorderWidget(group, start, end))
      );
    }
    default:
      return state;
  }
};

const findAvailableKey = (
  startI: number,
  existingSliceZones: (SlicesSM | null)[]
) => {
  for (let i = startI; i < Infinity; i++) {
    const key = `slices${i.toString()}`;
    if (!existingSliceZones.find((e) => e?.key === key)) {
      return i;
    }
  }
  return -1;
};
