import {
  updateWidgetMockConfig,
  deleteWidgetMockConfig,
  updateWidgetGroupMockConfig,
  deleteWidgetGroupMockConfig,
} from "./actions";

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
import { Dispatch } from "react";

export default class CustomTypeStore {
  constructor(readonly dispatch: Dispatch<CustomTypeActions>) {}

  reset = () => this.dispatch(resetCustomTypeCreator());

  // Async actions
  save = saveCustomType(this.dispatch);
  push = pushCustomType(this.dispatch);

  // Mock Config actions
  updateWidgetMockConfig = updateWidgetMockConfig(this.dispatch);
  deleteWidgetMockConfig = deleteWidgetMockConfig(this.dispatch);
  updateWidgetGroupMockConfig = updateWidgetGroupMockConfig(this.dispatch);
  deleteWidgetGroupMockConfig = deleteWidgetGroupMockConfig(this.dispatch);

  // Tab actions
  createTab = (tabId: string) => this.dispatch(createTabCreator({ tabId }));
  deleteTab = (tabId: string) => this.dispatch(deleteTabCreator({ tabId }));
  updateTab = (tabId: string, newTabId: string) =>
    this.dispatch(updateTabCreator({ tabId, newTabId }));

  // SliceZone actions
  createSliceZone = (tabId: string) =>
    this.dispatch(createSliceZoneCreator({ tabId }));

  // Field actions
  addField = (tabId: string, fieldId: string, field: Field) =>
    this.dispatch(addFieldCreator({ tabId, fieldId, field }));
  deleteField = (tabId: string, fieldId: string) =>
    this.dispatch(deleteFieldCreator({ tabId, fieldId }));
  reorderField = (tabId: string, start: number, end: number) =>
    this.dispatch(reorderFieldCreator({ tabId, start, end }));
  replaceField = (
    tabId: string,
    previousFieldId: string,
    newFieldId: string,
    value: Field
  ) =>
    this.dispatch(
      replaceFieldCreator({ tabId, previousFieldId, newFieldId, value })
    );

  // Field into group field actions
  addFieldIntoGroup = (
    tabId: string,
    groupId: string,
    fieldId: string,
    field: Field
  ) =>
    this.dispatch(addFieldIntoGroupCreator({ tabId, groupId, fieldId, field }));
  deleteFieldIntoGroup = (tabId: string, groupId: string, fieldId: string) =>
    this.dispatch(deleteFieldIntoGroupCreator({ tabId, groupId, fieldId }));
  reorderFieldIntoGroup = (
    tabId: string,
    groupId: string,
    start: number,
    end: number
  ) =>
    this.dispatch(reorderFieldIntoGroupCreator({ tabId, groupId, start, end }));
  replaceFieldIntoGroup = (
    tabId: string,
    groupId: string,
    previousFieldId: string,
    newFieldId: string,
    value: Field
  ) =>
    this.dispatch(
      replaceFieldIntoGroupCreator({
        tabId,
        groupId,
        previousFieldId,
        newFieldId,
        value,
      })
    );

  // Shared slice actions
  deleteSharedSlice = (tabId: string, sliceId: string) =>
    this.dispatch(deleteSharedSliceCreator({ tabId, sliceId }));
  replaceSharedSlice = (
    tabId: string,
    sliceKeys: [string],
    preserve: [string]
  ) => this.dispatch(replaceSharedSliceCreator({ tabId, sliceKeys, preserve }));
}
