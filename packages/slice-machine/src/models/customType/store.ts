import Store from "@lib/models/ui/Store";

import {
  updateWidgetMockConfig,
  deleteWidgetMockConfig,
  updateWidgetGroupMockConfig,
  deleteWidgetGroupMockConfig,
} from "./actions";

import {
  addFieldCreator,
  addFieldIntoGroupCreator,
  addSharedSliceCreator,
  createSliceZoneCreator,
  createTabCreator,
  deleteFieldCreator,
  deleteFieldIntoGroupCreator,
  deleteSharedSliceCreator,
  deleteSliceZoneCreator,
  deleteTabCreator,
  reorderFieldCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldCreator,
  replaceFieldIntoGroupCreator,
  replaceSharedSliceCreator,
  resetCustomTypeCreator,
  updateTabCreator,
} from "./newActions";

import saveCustomType from "./actions/save";
import pushCustomType from "./actions/push";

import { Field } from "@lib/models/common/CustomType/fields";

export default class CustomTypeStore implements Store {
  constructor(
    readonly dispatch: ({
      type,
      payload,
    }: {
      type: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload?: any;
    }) => void
  ) {}

  createTab(tabId: string): void {
    this.dispatch(createTabCreator({ tabId }));
  }

  reset(): void {
    this.dispatch(resetCustomTypeCreator());
  }

  save = saveCustomType(this.dispatch);
  push = pushCustomType(this.dispatch);
  updateWidgetMockConfig = updateWidgetMockConfig(this.dispatch);
  deleteWidgetMockConfig = deleteWidgetMockConfig(this.dispatch);
  updateWidgetGroupMockConfig = updateWidgetGroupMockConfig(this.dispatch);
  deleteWidgetGroupMockConfig = deleteWidgetGroupMockConfig(this.dispatch);
  // eslint-disable-next-line @typescript-eslint/ban-types
  tab(tabId: string): Record<string, Function> {
    return {
      update: (newKey: string): void => {
        this.dispatch(updateTabCreator({ tabId, newTabId: newKey }));
      },
      delete: (): void => {
        this.dispatch(deleteTabCreator({ tabId }));
      },
      addWidget: (fieldId: string, field: Field): void => {
        this.dispatch(addFieldCreator({ tabId, fieldId, field }));
      },
      removeWidget: (fieldId: string): void => {
        this.dispatch(deleteFieldCreator({ tabId, fieldId }));
      },
      replaceWidget: (
        previousFieldId: string,
        newFieldId: string,
        value: Field
      ): void => {
        this.dispatch(
          replaceFieldCreator({ tabId, previousFieldId, newFieldId, value })
        );
      },
      reorderWidget: (start: number, end: number): void => {
        this.dispatch(reorderFieldCreator({ tabId, start, end }));
      },
      createSliceZone: (): void => {
        this.dispatch(createSliceZoneCreator({ tabId }));
      },
      deleteSliceZone: (): void => {
        this.dispatch(deleteSliceZoneCreator({ tabId }));
      },
      addSharedSlice: (sliceId: string): void => {
        this.dispatch(addSharedSliceCreator({ tabId, sliceId }));
      },
      replaceSharedSlices: (sliceKeys: [string], preserve: [string]): void => {
        this.dispatch(
          replaceSharedSliceCreator({ tabId, sliceKeys, preserve })
        );
      },
      removeSharedSlice: (sliceId: string): void => {
        this.dispatch(deleteSharedSliceCreator({ tabId, sliceId }));
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      group: (groupId: string): Record<string, Function> => {
        return {
          addWidget: (fieldId: string, field: Field): void => {
            this.dispatch(
              addFieldIntoGroupCreator({ tabId, groupId, fieldId, field })
            );
          },
          replaceWidget: (
            previousFieldId: string,
            newFieldId: string,
            value: Field
          ): void => {
            this.dispatch(
              replaceFieldIntoGroupCreator({
                tabId,
                groupId,
                previousFieldId,
                newFieldId,
                value,
              })
            );
          },
          reorderWidget: (start: number, end: number): void => {
            this.dispatch(
              reorderFieldIntoGroupCreator({ tabId, groupId, start, end })
            );
          },
          deleteWidget: (fieldId: string): void => {
            this.dispatch(
              deleteFieldIntoGroupCreator({ tabId, groupId, fieldId })
            );
          },
        };
      },
    };
  }
}
