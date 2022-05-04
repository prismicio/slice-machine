import { SliceMachineStoreType } from "@src/redux/type";
import equal from "fast-deep-equal";
import {
  PoolOfFields,
  CustomTypeStatus,
} from "@src/modules/selectedCustomType/types";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import {
  CustomTypeSM,
  TabSM,
} from "@slicemachine/core/build/models/CustomType";
import { selectCustomTypeById } from "../availableCustomTypes";

// Selectors
export const selectCurrentCustomType = (
  store: SliceMachineStoreType
): CustomTypeSM | null => {
  if (!store.selectedCustomType) return null;
  return store.selectedCustomType.model;
};

export const selectCurrentMockConfig = (
  store: SliceMachineStoreType
): CustomTypeMockConfig | null => {
  if (!store.selectedCustomType) return null;
  return store.selectedCustomType.mockConfig;
};

export const selectCurrentPoolOfFields = (
  store: SliceMachineStoreType
): PoolOfFields => {
  if (!store.selectedCustomType) return [];
  return store.selectedCustomType.model.tabs.reduce<PoolOfFields>(
    (acc: PoolOfFields, curr: TabSM) => {
      return [...acc, ...curr.value];
    },
    []
  );
};

export const selectIsCurrentCustomTypeHasPendingModifications = (
  store: SliceMachineStoreType
) => {
  if (!store.selectedCustomType) return false;
  const initialModel = selectCustomTypeById(
    store,
    store.selectedCustomType.model.id
  );

  return (
    !equal(initialModel?.local, store.selectedCustomType.model) ||
    !equal(
      store.selectedCustomType.initialMockConfig,
      store.selectedCustomType.mockConfig
    )
  );
};

export const selectCustomTypeStatus = (
  store: SliceMachineStoreType
): CustomTypeStatus => {
  if (!store.selectedCustomType || !store.selectedCustomType.remoteModel)
    return CustomTypeStatus.New;

  if (
    !equal(store.selectedCustomType.model, store.selectedCustomType.remoteModel)
  ) {
    return CustomTypeStatus.Modified;
  }

  return CustomTypeStatus.Synced;
};
