import { Reducer } from "redux";
import { CustomTypeStatus, SelectedCustomTypeStoreType } from "./types";
import { getType } from "typesafe-actions";
import {
  createTabCreator,
  updateTabCreator,
  SelectedCustomTypeActions,
  initCustomTypeStoreCreator,
  addFieldCreator,
  deleteTabCreator,
  createSliceZoneCreator,
  deleteFieldCreator,
  deleteSharedSliceCreator,
  reorderFieldCreator,
  replaceFieldCreator,
  replaceSharedSliceCreator,
  deleteFieldMockConfigCreator,
  updateFieldMockConfigCreator,
  addFieldIntoGroupCreator,
  deleteFieldIntoGroupCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldIntoGroupCreator,
  saveCustomTypeCreator,
  pushCustomTypeCreator,
  updateGroupFieldMockConfigCreator,
  deleteGroupFieldMockConfigCreator,
} from "./actions";
import { Tab } from "@models/common/CustomType/tab";
import { SliceZone } from "@models/common/CustomType/sliceZone";
import { AnyWidget } from "@models/common/widgets/Widget";
import * as Widgets from "@models/common/widgets/withGroup";
import StateHelpers from "./stateHelpers";
import { CustomType } from "@models/common/CustomType";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { SlicesSM } from "@slicemachine/core/build/models/Slices";
import { GroupSM } from "@slicemachine/core/build/models/Group";
import { Group } from "@lib/models/common/CustomType/group";
import { renameCustomTypeCreator } from "../availableCustomTypes";
import { getCustomTypeStatus } from "../../../server/src/api/custom-types/getCustomTypeStatus";

// Reducer
export const selectedCustomTypeReducer: Reducer<
  SelectedCustomTypeStoreType,
  SelectedCustomTypeActions
> = (state = null, action) => {
  switch (action.type) {
    case getType(initCustomTypeStoreCreator):
      return {
        ...state,
        model: action.payload.model,
        initialModel: action.payload.model,
        remoteModel: action.payload.remoteModel,
        mockConfig: action.payload.mockConfig,
        initialMockConfig: action.payload.mockConfig,
      };
    case getType(saveCustomTypeCreator.success): {
      if (!state) return state;

      return {
        ...state,
        model: {
          ...state.model,
          __status: getCustomTypeStatus(state.model, state.remoteModel),
        },
        initialModel: {
          ...state.model,
          __status: getCustomTypeStatus(state.model, state.remoteModel),
        },
        initialMockConfig: state.mockConfig,
      };
    }
    case getType(pushCustomTypeCreator.success):
      if (!state) return state;

      return {
        ...state,
        model: {
          ...state.model,
          __status: CustomTypeStatus.Synced,
        },
        initialModel: {
          ...state.model,
          __status: CustomTypeStatus.Synced,
        },
        remoteModel: state.model,
      };
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
    case getType(deleteTabCreator): {
      if (!state) return state;
      const { tabId } = action.payload;
      return StateHelpers.deleteTab(state, tabId);
    }
    case getType(addFieldCreator): {
      const { tabId, field, fieldId } = action.payload;
      try {
        if (
          field.type === WidgetTypes.Range ||
          field.type === WidgetTypes.IntegrationField ||
          field.type === WidgetTypes.Separator
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
          value.type === WidgetTypes.Range ||
          value.type === WidgetTypes.IntegrationField ||
          value.type === WidgetTypes.Separator
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
    case getType(updateFieldMockConfigCreator): {
      if (!state) return state;
      if (!action.payload.customTypeMockConfig) return state;
      const updatedConfig = CustomTypeMockConfig.updateFieldMockConfig(
        action.payload.customTypeMockConfig,
        action.payload.previousFieldId,
        action.payload.fieldId,
        action.payload.value
      );
      return {
        ...state,
        mockConfig: updatedConfig,
      };
    }
    case getType(deleteFieldMockConfigCreator):
      if (!state) return state;
      if (!action.payload.customTypeMockConfig) return state;

      const updatedConfig = CustomTypeMockConfig.deleteFieldMockConfig(
        action.payload.customTypeMockConfig,
        action.payload.fieldId
      );

      return {
        ...state,
        mockConfig: updatedConfig,
      };
    case getType(updateGroupFieldMockConfigCreator): {
      if (!state) return state;

      const updatedConfig = CustomTypeMockConfig.updateGroupFieldMockConfig(
        action.payload.customTypeMockConfig,
        action.payload.groupId,
        action.payload.previousFieldId,
        action.payload.fieldId,
        action.payload.value
      );

      return {
        ...state,
        mockConfig: updatedConfig,
      };
    }
    case getType(deleteGroupFieldMockConfigCreator): {
      if (!state) return state;
      if (!action.payload.customTypeMockConfig) return state;

      const updatedConfig = CustomTypeMockConfig.deleteGroupFieldMockConfig(
        action.payload.customTypeMockConfig,
        action.payload.groupId,
        action.payload.fieldId
      );

      return {
        ...state,
        mockConfig: updatedConfig,
      };
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
    case getType(renameCustomTypeCreator.success): {
      if (!state) return state;
      const newName = action.payload.newCustomTypeName;

      return {
        ...state,
        model: {
          ...state.model,
          label: newName,
          __status: CustomTypeStatus.Modified,
        },
        initialModel: {
          ...state.initialModel,
          label: newName,
          __status: CustomTypeStatus.Modified,
        },
      };
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
