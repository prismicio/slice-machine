import {SliceMachineStoreType} from "@src/redux/type";
import equal from "fast-deep-equal";
import {CustomTypeState, CustomTypeStatus} from "@models/ui/CustomTypeState";
import {PoolOfFields} from "@src/modules/customType/types";
import {ArrayTabs, CustomType} from "@models/common/CustomType";

// Selectors
export const selectCurrentCustomType = (store: SliceMachineStoreType): CustomType<ArrayTabs> | null => {
  if (!store.customType) return null
  return store.customType.model
}

export const selectCurrentMockConfig = (store: SliceMachineStoreType): any | null => {
  if (!store.customType) return null
  return store.customType.mockConfig
}

export const selectCurrentPoolOfFields = (store: SliceMachineStoreType): PoolOfFields => {
  if (!store.customType) return [];
  return CustomTypeState.getPool(store.customType.model.tabs)
}

export const selectIsCurrentCustomTypeHasPendingModifications = (store: SliceMachineStoreType) => {
  if (!store.customType) return false
  return !equal(store.customType.initialModel, store.customType.model) || !equal(store.customType.initialMockConfig, store.customType.mockConfig)
}

export const selectCustomTypeStatus = (store: SliceMachineStoreType): CustomTypeStatus => {
  if (!store.customType || !store.customType.remoteModel) return CustomTypeStatus.New

  if (!equal(store.customType.model, store.customType.remoteModel)) {
    return CustomTypeStatus.Modified;
  }

  return CustomTypeStatus.Synced;
}