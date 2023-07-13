import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeSM, TabField } from "@lib/models/common/CustomType";

export type SelectedCustomTypeActions =
  | ActionType<typeof initCustomTypeStoreCreator>
  | ActionType<typeof cleanupCustomTypeStoreCreator>
  | ActionType<typeof saveCustomTypeCreator>
  | ActionType<typeof createTabCreator>
  | ActionType<typeof updateTabCreator>
  | ActionType<typeof deleteTabCreator>
  | ActionType<typeof addFieldCreator>
  | ActionType<typeof deleteFieldCreator>
  | ActionType<typeof replaceFieldCreator>
  | ActionType<typeof reorderFieldCreator>
  | ActionType<typeof createSliceZoneCreator>
  | ActionType<typeof deleteSliceZoneCreator>
  | ActionType<typeof addFieldIntoGroupCreator>
  | ActionType<typeof replaceSharedSliceCreator>
  | ActionType<typeof replaceFieldIntoGroupCreator>
  | ActionType<typeof reorderFieldIntoGroupCreator>
  | ActionType<typeof deleteFieldIntoGroupCreator>
  | ActionType<typeof deleteSharedSliceCreator>
  | ActionType<typeof renameSelectedCustomTypeLabel>;

export const initCustomTypeStoreCreator = createAction("CUSTOM_TYPE/INIT")<{
  model: CustomTypeSM;
  remoteModel: CustomTypeSM | undefined;
}>();

export const cleanupCustomTypeStoreCreator = createAction(
  "CUSTOM_TYPE/CLEANUP"
)();

// Async actions
export const saveCustomTypeCreator = createAsyncAction(
  "CUSTOM_TYPE/SAVE.REQUEST",
  "CUSTOM_TYPE/SAVE.RESPONSE",
  "CUSTOM_TYPE/SAVE.FAILURE"
)<undefined, { customType: CustomTypeSM }>();

// Tab actions
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
  field: TabField;
}>();

export const deleteFieldCreator = createAction("CUSTOM_TYPE/DELETE_FIELD")<{
  tabId: string;
  fieldId: string;
}>();

export const replaceFieldCreator = createAction("CUSTOM_TYPE/REPLACE_FIELD")<{
  tabId: string;
  previousFieldId: string;
  newFieldId: string;
  value: TabField;
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

export type ReplaceSharedSliceCreatorPayload = {
  tabId: string;
  sliceKeys: string[];
  preserve: string[];
};

export const replaceSharedSliceCreator = createAction(
  "CUSTOM_TYPE/REPLACE_SHARED_SLICE"
)<ReplaceSharedSliceCreatorPayload>();

export const deleteSharedSliceCreator = createAction(
  "CUSTOM_TYPE/DELETE_SHARED_SLICE"
)<{
  tabId: string;
  sliceId: string;
}>();

export const renameSelectedCustomTypeLabel = createAction(
  "CUSTOM_TYPE/RENAME_CUSTOM_TYPE"
)<{
  newLabel: string;
}>();

// Group actions (can be grouped into the field actions probably)
export const addFieldIntoGroupCreator = createAction(
  "CUSTOM_TYPE/GROUP/ADD_FIELD"
)<{
  tabId: string;
  groupId: string;
  fieldId: string;
  field: NestableWidget;
}>();

export const replaceFieldIntoGroupCreator = createAction(
  "CUSTOM_TYPE/GROUP/REPLACE_FIELD"
)<{
  tabId: string;
  groupId: string;
  previousFieldId: string;
  newFieldId: string;
  value: NestableWidget;
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
