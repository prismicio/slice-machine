import { useMemo } from "react";
import { useSelector } from "react-redux";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import {
  ChangedCustomType,
  ChangedSlice,
  ModelStatus,
  computeModelStatus,
} from "@lib/models/common/ModelStatus";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { getFrontendSlices, getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  LocalOrRemoteCustomType,
  LocalOrRemoteModel,
  LocalOrRemoteSlice,
  RemoteOnlySlice,
  getModelId,
  hasLocal,
  isRemoteOnly,
} from "@lib/models/common/ModelData";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { AuthStatus } from "@src/modules/userContext/types";
import { getAuthStatus } from "@src/modules/environment";

import { useNetwork } from "./useNetwork";

export const unSyncStatuses = [
  ModelStatus.New,
  ModelStatus.Modified,
  ModelStatus.Deleted,
];

export interface UnSyncChanges {
  unSyncedSlices: ComponentUI[];
  unSyncedCustomTypes: LocalOrRemoteCustomType[];
  authStatus: AuthStatus;
  isOnline: boolean;
  modelsStatuses: ModelsStatuses;
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

type GetUnSyncChangesArgs = {
  customTypes: LocalOrRemoteCustomType[];
  libraries: Readonly<LibraryUI[]>;
  modelsStatuses: ModelsStatuses;
  slices: LocalOrRemoteSlice[];
};

export function getUnSyncChanges(args: GetUnSyncChangesArgs) {
  const { customTypes, libraries, modelsStatuses, slices } = args;

  const localComponents: ComponentUI[] = libraries.flatMap(
    (lib) => lib.components,
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
      unSyncStatuses.includes(modelsStatuses.slices[component.model.id]),
  );
  const unSyncedCustomTypes = customTypes.filter(
    (customType) =>
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      modelsStatuses.customTypes[getModelId(customType)] &&
      unSyncStatuses.includes(
        modelsStatuses.customTypes[getModelId(customType)],
      ),
  );

  return {
    unSyncedSlices,
    unSyncedCustomTypes,
  };
}

export type GetChangesArgs = {
  unSyncedSlices: ComponentUI[];
  unSyncedCustomTypes: LocalOrRemoteCustomType[];
  modelsStatuses: ModelsStatuses;
};

export function getChanges(args: GetChangesArgs) {
  const { unSyncedSlices, unSyncedCustomTypes, modelsStatuses } = args;

  const changedSlices = unSyncedSlices
    .map((s) => ({
      slice: s,
      status: modelsStatuses.slices[s.model.id],
    }))
    .filter((s): s is ChangedSlice => unSyncStatuses.includes(s.status)); // TODO can we sync unSyncStatuses and ChangedSlice?
  const changedCustomTypes = unSyncedCustomTypes
    .map((model) => (hasLocal(model) ? model.local : model.remote))
    .map((ct) => ({
      customType: ct,
      status: modelsStatuses.customTypes[ct.id],
    }))
    .filter((c): c is ChangedCustomType => unSyncStatuses.includes(c.status));

  return {
    changedSlices,
    changedCustomTypes,
  };
}

export const useUnSyncChanges = (): UnSyncChanges => {
  const { customTypes, slices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectAllCustomTypes(store),
      slices: getFrontendSlices(store),
      libraries: getLibraries(store),
    }),
  );
  const isOnline = useNetwork();
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));

  const modelsStatuses = getModelStatus({
    slices,
    customTypes,
    isOnline,
    authStatus,
  });

  const { unSyncedSlices, unSyncedCustomTypes } = getUnSyncChanges({
    customTypes,
    libraries,
    modelsStatuses,
    slices,
  });

  return useMemo(
    () => ({
      unSyncedSlices,
      unSyncedCustomTypes,
      modelsStatuses,
      authStatus,
      isOnline,
    }),
    [unSyncedSlices, unSyncedCustomTypes, modelsStatuses, authStatus, isOnline],
  );
};

// Slices and Custom Types needs to be separated as Ids are not unique amongst each others.
export type ModelsStatuses = {
  slices: { [sliceId: string]: ModelStatus };
  customTypes: { [ctId: string]: ModelStatus };
};

function computeStatuses(
  models: LocalOrRemoteCustomType[],
  userHasAccessToModels: boolean,
): { [sliceId: string]: ModelStatus };
function computeStatuses(
  models: LocalOrRemoteSlice[],
  userHasAccessToModels: boolean,
): { [sliceId: string]: ModelStatus };
function computeStatuses(
  models: LocalOrRemoteModel[],
  userHasAccessToModels: boolean,
) {
  return models.reduce<{ [id: string]: ModelStatus }>(
    (acc, model) => {
      const { status } = computeModelStatus(model, userHasAccessToModels);

      return {
        ...acc,
        [hasLocal(model) ? model.local.id : model.remote.id]: status,
      };
    },
    {} as { [sliceId: string]: ModelStatus },
  );
}

type GetModelStatusArgs = {
  slices: LocalOrRemoteSlice[];
  customTypes: LocalOrRemoteCustomType[];
  isOnline: boolean;
  authStatus: AuthStatus;
};

export const getModelStatus = (args: GetModelStatusArgs): ModelsStatuses => {
  const { slices, customTypes, isOnline, authStatus } = args;

  const userHasAccessToModels =
    isOnline &&
    authStatus != AuthStatus.FORBIDDEN &&
    authStatus != AuthStatus.UNAUTHORIZED;

  const modelsStatuses = {
    slices: computeStatuses(slices, userHasAccessToModels),
    customTypes: computeStatuses(customTypes, userHasAccessToModels),
  };

  return modelsStatuses;
};
