import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { getFrontendSlices, getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";
import { ModelStatusInformation, useModelStatus } from "./useModelStatus";
import {
  LocalOrRemoteCustomType,
  RemoteOnlySlice,
  getModelId,
  isRemoteOnly,
} from "@lib/models/common/ModelData";

export const unSyncStatuses = [
  ModelStatus.New,
  ModelStatus.Modified,
  ModelStatus.Deleted,
];

export interface UnSyncChanges extends ModelStatusInformation {
  unSyncedSlices: ComponentUI[];
  unSyncedCustomTypes: LocalOrRemoteCustomType[];
}

// ComponentUI are manipulated on all the relevant pages
// But the data is not available for remote only slices
// which have been deleted locally
// Should revisit this with the sync improvements
const wrapDeletedSlice = (s: RemoteOnlySlice): ComponentUI => ({
  model: s.remote,
  screenshots: {},
  from: "",
  href: "",
  pathToSlice: "",
  fileName: "",
  extension: "",
});

export const useUnSyncChanges = (): UnSyncChanges => {
  const { customTypes, slices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectAllCustomTypes(store),
      slices: getFrontendSlices(store),
      libraries: getLibraries(store),
    })
  );

  const { modelsStatuses, authStatus, isOnline } = useModelStatus({
    slices,
    customTypes,
  });

  const localComponents: ComponentUI[] = libraries.flatMap(
    (lib) => lib.components
  );

  const deletedComponents: ComponentUI[] = slices
    .filter(isRemoteOnly)
    .map(wrapDeletedSlice);

  const components: ComponentUI[] = localComponents
    .concat(deletedComponents)
    .sort((s1, s2) => (s1.model.name > s2.model.name ? 1 : -1));

  const unSyncedSlices = components.filter(
    (component) =>
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      modelsStatuses.slices[component.model.id] &&
      unSyncStatuses.includes(modelsStatuses.slices[component.model.id])
  );
  const unSyncedCustomTypes = customTypes.filter(
    (customType) =>
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      modelsStatuses.customTypes[getModelId(customType)] &&
      unSyncStatuses.includes(
        modelsStatuses.customTypes[getModelId(customType)]
      )
  );

  return {
    unSyncedSlices,
    unSyncedCustomTypes,
    modelsStatuses,
    authStatus,
    isOnline,
  };
};
