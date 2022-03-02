import equal from "fast-deep-equal";
import {
  CustomTypeState,
  CustomTypeStatus,
} from "@lib/models/ui/CustomTypeState";
import { Tab } from "@lib/models/common/CustomType/tab";

import { Group } from "@lib/models/common/CustomType/group";
import {
  SliceZone,
  SliceZoneAsArray,
  sliceZoneType,
} from "@lib/models/common/CustomType/sliceZone";
import { CustomType } from "@lib/models/common/CustomType";

import { AnyWidget } from "@lib/models/common/widgets/Widget";

import * as Widgets from "@lib/models/common/widgets/withGroup";
import { AsArray, GroupField } from "@lib/models/common/widgets/Group/type";
import { getType } from "typesafe-actions";
import {
  addFieldCreator,
  addFieldIntoGroupCreator,
  createSliceZoneCreator,
  createTabCreator,
  CustomTypeActions,
  deleteFieldCreator,
  deleteFieldIntoGroupCreator,
  deleteSharedSliceCreator,
  deleteTabCreator,
  deleteFieldMockConfigCreator,
  pushCustomTypeCreator,
  reorderFieldCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldCreator,
  replaceFieldIntoGroupCreator,
  replaceSharedSliceCreator,
  resetCustomTypeCreator,
  saveCustomTypeCreator,
  updateTabCreator,
  updateFieldMockConfigCreator,
} from "./newActions";

export default function reducer(
  prevState: CustomTypeState,
  action: CustomTypeActions
): CustomTypeState {
  const result = ((): CustomTypeState => {
    switch (action.type) {
      case getType(resetCustomTypeCreator): {
        return {
          ...prevState,
          current: prevState.initialCustomType,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          mockConfig: prevState.initialMockConfig,
        };
      }
      case getType(createTabCreator): {
        const { tabId } = action.payload;
        if (prevState.current.tabs.find((e) => e.key === tabId)) {
          return prevState;
        }
        return {
          ...prevState,
          current: {
            ...prevState.current,
            tabs: [...prevState.current.tabs, Tab.init(tabId)],
          },
        };
      }
      case getType(updateTabCreator): {
        const { tabId, newTabId } = action.payload;
        if (newTabId === tabId) {
          return prevState;
        }
        return {
          ...prevState,
          current: {
            ...prevState.current,
            tabs: prevState.current.tabs.map((t) => {
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
        const { tabId } = action.payload;
        return CustomTypeState.deleteTab(prevState, tabId);
      }
      case getType(saveCustomTypeCreator): {
        const { state } = action.payload;
        return {
          ...state,
          initialCustomType: state.current,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          initialMockConfig: state.mockConfig,
        };
      }
      case getType(pushCustomTypeCreator):
        return {
          ...prevState,
          initialCustomType: prevState.current,
          remoteCustomType: prevState.current,
        };
      case getType(addFieldCreator): {
        const { tabId, field, fieldId } = action.payload;
        try {
          if (field.type !== sliceZoneType) {
            const CurrentWidget: AnyWidget = Widgets[field.type];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            CurrentWidget.schema.validateSync(field, { stripUnknown: false });
            return CustomTypeState.updateTab(
              prevState,
              tabId
            )((tab) => Tab.addWidget(tab, fieldId, field));
          }
          return prevState;
        } catch (err) {
          console.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `[store/addWidget] Model is invalid for widget "${field.type}".\nFull error: ${err}`
          );
          return prevState;
        }
      }
      case getType(deleteFieldCreator): {
        const { tabId, fieldId } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
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
            return CustomTypeState.updateTab(
              prevState,
              tabId
            )((tab) =>
              Tab.replaceWidget(tab, previousFieldId, newFieldId, value)
            );
          }
          return prevState;
        } catch (err) {
          return prevState;
        }
      }
      case getType(reorderFieldCreator): {
        const { tabId, start, end } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) => Tab.reorderWidget(tab, start, end));
      }
      case getType(createSliceZoneCreator): {
        const { tabId } = action.payload;

        const tabIndex = prevState.current.tabs.findIndex(
          (t) => t.key === tabId
        );
        if (tabIndex === -1) {
          console.error(`No tabId ${tabId} found in tabs`);
          return prevState;
        }

        const existingSliceZones = CustomType.getSliceZones(
          prevState.current
        ).filter((e) => e);
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) => {
          const i = findAvailableKey(tabIndex, existingSliceZones);
          return Tab.createSliceZone(
            tab,
            `slices${i !== 0 ? i.toString() : ""}`
          );
        });
      }
      case getType(replaceSharedSliceCreator): {
        const { tabId, sliceKeys, preserve } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) =>
            SliceZone.replaceSharedSlice(sliceZone, sliceKeys, preserve)
          )
        );
      }
      case getType(deleteSharedSliceCreator): {
        const { tabId, sliceId } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) =>
            SliceZone.removeSharedSlice(sliceZone, sliceId)
          )
        );
      }
      case getType(updateFieldMockConfigCreator):
        return {
          ...prevState,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          mockConfig: action.payload.mockConfig,
        };
      case getType(deleteFieldMockConfigCreator):
        return {
          ...prevState,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          mockConfig: action.payload.mockConfig,
        };
      case getType(addFieldIntoGroupCreator): {
        const { tabId, groupId, fieldId, field } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) =>
          Tab.updateGroup(
            tab,
            groupId
          )((group: GroupField<AsArray>) =>
            Group.addWidget(group, { key: fieldId, value: field })
          )
        );
      }
      case getType(replaceFieldIntoGroupCreator): {
        const { tabId, groupId, previousFieldId, newFieldId, value } =
          action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) =>
          Tab.updateGroup(
            tab,
            groupId
          )((group: GroupField<AsArray>) =>
            Group.replaceWidget(group, previousFieldId, newFieldId, value)
          )
        );
      }
      case getType(deleteFieldIntoGroupCreator): {
        const { tabId, groupId, fieldId } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) =>
          Tab.updateGroup(
            tab,
            groupId
          )((group: GroupField<AsArray>) => Group.deleteWidget(group, fieldId))
        );
      }
      case getType(reorderFieldIntoGroupCreator): {
        const { tabId, groupId, start, end } = action.payload;
        return CustomTypeState.updateTab(
          prevState,
          tabId
        )((tab) =>
          Tab.updateGroup(
            tab,
            groupId
          )((group: GroupField<AsArray>) =>
            Group.reorderWidget(group, start, end)
          )
        );
      }
      default:
        throw new Error("Invalid action.");
    }
  })();

  return {
    ...result,
    poolOfFieldsToCheck: CustomTypeState.getPool(result.current.tabs),
    __status: (() => {
      if (!result.remoteCustomType) {
        return CustomTypeStatus.New;
      }
      if (equal(result.current, result.remoteCustomType)) {
        return CustomTypeStatus.Synced;
      }
      return CustomTypeStatus.Modified;
    })(),
    isTouched:
      !equal(result.initialCustomType, result.current) ||
      !equal(result.initialMockConfig, result.mockConfig),
  };
}

const findAvailableKey = (
  startI: number,
  existingSliceZones: (SliceZoneAsArray | null)[]
) => {
  for (let i = startI; i < Infinity; i++) {
    const key = `slices${i.toString()}`;
    if (!existingSliceZones.find((e) => e?.key === key)) {
      return i;
    }
  }
  return -1;
};
