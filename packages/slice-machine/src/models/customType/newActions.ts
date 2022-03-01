import { ActionType, createAction } from "typesafe-actions";

import { Field } from "@models/common/CustomType/fields";

export type CustomTypeActions =
  | ActionType<typeof resetCustomTypeCreator>
  | ActionType<typeof saveCustomTypeCreator>
  | ActionType<typeof pushCustomTypeCreator>
  | ActionType<typeof updateWidgetMockConfigCreator>
  | ActionType<typeof deleteWidgetMockConfigCreator>
  | ActionType<typeof updateWidgetGroupMockConfigCreator>
  | ActionType<typeof deleteWidgetGroupMockConfigCreator>
  | ActionType<typeof createTabCreator>
  | ActionType<typeof updateTabCreator>
  | ActionType<typeof deleteTabCreator>
  | ActionType<typeof addFieldCreator>
  | ActionType<typeof deleteFieldCreator>
  | ActionType<typeof replaceFieldCreator>
  | ActionType<typeof reorderFieldCreator>
  | ActionType<typeof createSliceZoneCreator>
  | ActionType<typeof deleteSliceZoneCreator>
  | ActionType<typeof addSharedSliceCreator>
  | ActionType<typeof addFieldIntoGroupCreator>
  | ActionType<typeof replaceSharedSliceCreator>
  | ActionType<typeof replaceFieldIntoGroupCreator>
  | ActionType<typeof reorderFieldIntoGroupCreator>
  | ActionType<typeof deleteFieldIntoGroupCreator>
  | ActionType<typeof deleteSharedSliceCreator>;

export const resetCustomTypeCreator = createAction("CUSTOM_TYPE/RESET")();

// Async actions
export const saveCustomTypeCreator = createAction("CUSTOM_TYPE/SAVE")();
export const pushCustomTypeCreator = createAction("CUSTOM_TYPE/SAVE")();

// Mock config actions
export const updateWidgetMockConfigCreator = createAction(
  "CUSTOM_TYPE/UPDATE_WIDGET_MOCK_CONFIG"
)();
export const deleteWidgetMockConfigCreator = createAction(
  "CUSTOM_TYPE/DELETE_WIDGET_MOCK_CONFIG"
)();
export const updateWidgetGroupMockConfigCreator = createAction(
  "CUSTOM_TYPE/UPDATE_WIDGET_GROUP__MOCK_CONFIG"
)();
export const deleteWidgetGroupMockConfigCreator = createAction(
  "CUSTOM_TYPE/DELETE_WIDGET_GROUP_MOCK_CONFIG"
)();

// Variation actions
export const createTabCreator = createAction("CUSTOM_TYPE/CREATE_TAB")<{
  tabId: string;
}>();
export const updateTabCreator = createAction("CUSTOM_TYPE/UPDATE_TAB")<{
  tabId: string;
  newTabId: string;
}>();
export const deleteTabCreator = createAction("CUSTOM_TYPE/DELETE_TAB")<{
  tabId: string;
}>();

// Field actions
export const addFieldCreator = createAction("CUSTOM_TYPE/ADD_FIELD")<{
  tabId: string;
  fieldId: string;
  field: Field;
}>();
export const deleteFieldCreator = createAction("CUSTOM_TYPE/DELETE_FIELD")<{
  tabId: string;
  fieldId: string;
}>();
export const replaceFieldCreator = createAction("CUSTOM_TYPE/REPLACE_FIELD")<{
  tabId: string;
  previousFieldId: string;
  newFieldId: string;
  value: Field;
}>();
export const reorderFieldCreator = createAction("CUSTOM_TYPE/REORDER_FIELD")<{
  tabId: string;
  start: number;
  end: number;
}>();

// Slice zone actions
export const createSliceZoneCreator = createAction(
  "CUSTOM_TYPE/CREATE_SLICE_ZONE"
)<{
  tabId: string;
}>();
export const deleteSliceZoneCreator = createAction(
  "CUSTOM_TYPE/DELETE_SLICE_ZONE"
)<{
  tabId: string;
}>();
export const addSharedSliceCreator = createAction(
  "CUSTOM_TYPE/ADD_SHARED_SLICE"
)<{
  tabId: string;
  sliceId: string;
}>();
export const replaceSharedSliceCreator = createAction(
  "CUSTOM_TYPE/REPLACE_SHARED_SLICE"
)<{
  tabId: string;
  sliceKeys: [string];
  preserve: [string];
}>();
export const deleteSharedSliceCreator = createAction(
  "CUSTOM_TYPE/DELETE_SHARED_SLICE"
)<{
  tabId: string;
  sliceId: string;
}>();

// Group actions (can be grouped into the field actions probably)
export const addFieldIntoGroupCreator = createAction(
  "CUSTOM_TYPE/GROUP/ADD_FIELD"
)<{
  tabId: string;
  groupId: string;
  fieldId: string;
  field: Field;
}>();
export const replaceFieldIntoGroupCreator = createAction(
  "CUSTOM_TYPE/GROUP/REPLACE_FIELD"
)<{
  tabId: string;
  groupId: string;
  previousFieldId: string;
  newFieldId: string;
  value: Field;
}>();
export const reorderFieldIntoGroupCreator = createAction(
  "CUSTOM_TYPE/GROUP/REORDER_FIELD"
)<{
  tabId: string;
  groupId: string;
  start: number;
  end: number;
}>();
export const deleteFieldIntoGroupCreator = createAction(
  "CUSTOM_TYPE/GROUP/DELETE_FIELD"
)<{
  tabId: string;
  groupId: string;
  fieldId: string;
}>();
