import {
  updateWidgetMockConfig as updateWidgetMockConfigHelper,
  deleteWidgetMockConfig as deleteWidgetMockConfigHelper,
  updateWidgetGroupMockConfig as updateWidgetGroupMockConfigHelper,
  deleteWidgetGroupMockConfig as deleteWidgetGroupMockConfigHelper,
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

export type UseCustomTypeActionsReturnType = ReturnType<
  typeof useCustomTypeActions
>;

const useCustomTypeActions = (dispatch: Dispatch<CustomTypeActions>) => {
  const reset = () => dispatch(resetCustomTypeCreator());

  // Async actions
  const save = saveCustomType(dispatch);
  const push = pushCustomType(dispatch);

  // Mock Config actions
  const updateWidgetMockConfig = updateWidgetMockConfigHelper(dispatch);
  const deleteWidgetMockConfig = deleteWidgetMockConfigHelper(dispatch);
  const updateWidgetGroupMockConfig =
    updateWidgetGroupMockConfigHelper(dispatch);
  const deleteWidgetGroupMockConfig =
    deleteWidgetGroupMockConfigHelper(dispatch);

  // Tab actions
  const createTab = (tabId: string) => dispatch(createTabCreator({ tabId }));
  const deleteTab = (tabId: string) => dispatch(deleteTabCreator({ tabId }));
  const updateTab = (tabId: string, newTabId: string) =>
    dispatch(updateTabCreator({ tabId, newTabId }));

  // SliceZone actions
  const createSliceZone = (tabId: string) =>
    dispatch(createSliceZoneCreator({ tabId }));

  // Field actions
  const addField = (tabId: string, fieldId: string, field: Field) =>
    dispatch(addFieldCreator({ tabId, fieldId, field }));
  const deleteField = (tabId: string, fieldId: string) =>
    dispatch(deleteFieldCreator({ tabId, fieldId }));
  const reorderField = (tabId: string, start: number, end: number) =>
    dispatch(reorderFieldCreator({ tabId, start, end }));
  const replaceField = (
    tabId: string,
    previousFieldId: string,
    newFieldId: string,
    value: Field
  ) =>
    dispatch(
      replaceFieldCreator({ tabId, previousFieldId, newFieldId, value })
    );

  // Field into group field actions
  const addFieldIntoGroup = (
    tabId: string,
    groupId: string,
    fieldId: string,
    field: Field
  ) => dispatch(addFieldIntoGroupCreator({ tabId, groupId, fieldId, field }));
  const deleteFieldIntoGroup = (
    tabId: string,
    groupId: string,
    fieldId: string
  ) => dispatch(deleteFieldIntoGroupCreator({ tabId, groupId, fieldId }));
  const reorderFieldIntoGroup = (
    tabId: string,
    groupId: string,
    start: number,
    end: number
  ) => dispatch(reorderFieldIntoGroupCreator({ tabId, groupId, start, end }));
  const replaceFieldIntoGroup = (
    tabId: string,
    groupId: string,
    previousFieldId: string,
    newFieldId: string,
    value: Field
  ) =>
    dispatch(
      replaceFieldIntoGroupCreator({
        tabId,
        groupId,
        previousFieldId,
        newFieldId,
        value,
      })
    );

  // Shared slice actions
  const deleteSharedSlice = (tabId: string, sliceId: string) =>
    dispatch(deleteSharedSliceCreator({ tabId, sliceId }));
  const replaceSharedSlice = (
    tabId: string,
    sliceKeys: string[],
    preserve: string[]
  ) => dispatch(replaceSharedSliceCreator({ tabId, sliceKeys, preserve }));

  return {
    reset,
    save,
    push,
    updateWidgetMockConfig,
    deleteWidgetMockConfig,
    updateWidgetGroupMockConfig,
    deleteWidgetGroupMockConfig,
    createTab,
    deleteTab,
    updateTab,
    createSliceZone,
    addField,
    deleteField,
    reorderField,
    replaceField,
    addFieldIntoGroup,
    deleteFieldIntoGroup,
    reorderFieldIntoGroup,
    replaceFieldIntoGroup,
    deleteSharedSlice,
    replaceSharedSlice,
  };
};

export default useCustomTypeActions;
