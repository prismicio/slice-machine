import {SliceMachineStoreType} from "@src/redux/type";
import equal from "fast-deep-equal";
import {CustomTypeStatus} from "@models/ui/CustomTypeState";

// Selectors
export const selectCurrentCustomType = (store: SliceMachineStoreType) => {
  if (!store.customType) return null
  return store.customType.model
}

export const selectCurrentMockConfig = (store: SliceMachineStoreType) => {
  if (!store.customType) return null
  return store.customType.mockConfig
}

export const selectCurrentPoolOfFields = (store: SliceMachineStoreType) => {
  if (!store.customType) return null
  return store.customType.poolOfFieldsToCheck
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