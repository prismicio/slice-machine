import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import { getFrontendSlices, getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";
import { ModelStatusInformation, useModelStatus } from "./useModelStatus";

const unSyncStatuses = [ModelStatus.New, ModelStatus.Modified];

export interface UnSyncChanges extends ModelStatusInformation {
  unSyncedSlices: ComponentUI[];
  unSyncedCustomTypes: FrontEndCustomType[];
}

export const useUnSyncChanges = (): UnSyncChanges => {
  const { customTypes, slices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectAllCustomTypes(store),
      slices: getFrontendSlices(store),
      libraries: getLibraries(store),
    })
  );

  const { modelsStatuses, authStatus, isOnline } = useModelStatus([
    ...customTypes,
    ...slices,
  ]);

  const components: ComponentUI[] = libraries.reduce(
    (acc: ComponentUI[], lib: LibraryUI) => {
      return [...acc, ...lib.components];
    },
    []
  );

  const unSyncedSlices = components.filter(
    (component) =>
      modelsStatuses.slices[component.model.id] &&
      unSyncStatuses.includes(modelsStatuses.slices[component.model.id])
  );
  const unSyncedCustomTypes = customTypes.filter(
    (customType) =>
      modelsStatuses.customTypes[customType.local.id] &&
      unSyncStatuses.includes(modelsStatuses.customTypes[customType.local.id])
  );

  return {
    unSyncedSlices,
    unSyncedCustomTypes,
    modelsStatuses,
    authStatus,
    isOnline,
  };
};
