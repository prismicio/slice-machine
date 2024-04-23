import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import {
  getModelId,
  hasLocal,
  isRemoteOnly,
  LocalOrRemoteCustomType,
  LocalOrRemoteSlice,
  RemoteOnlySlice,
} from "@/legacy/lib/models/common/ModelData";
import {
  ChangedCustomType,
  ChangedSlice,
  computeStatuses,
  ModelStatus,
} from "@/legacy/lib/models/common/ModelStatus";
import { AuthStatus } from "@/modules/userContext/types";

type GetUnSyncedChangesArgs = {
  customTypes: LocalOrRemoteCustomType[];
  libraries: Readonly<LibraryUI[]>;
  slices: LocalOrRemoteSlice[];
  isOnline: boolean;
  authStatus: AuthStatus;
};

const unSyncStatuses = [
  ModelStatus.New,
  ModelStatus.Modified,
  ModelStatus.Deleted,
];

export type UnSyncedChanges = {
  changedCustomTypes: ChangedCustomType[];
  unSyncedCustomTypes: LocalOrRemoteCustomType[];
  changedSlices: ChangedSlice[];
  unSyncedSlices: ComponentUI[];
  modelsStatuses: ModelsStatuses;
};

export function getUnSyncedChanges(
  args: GetUnSyncedChangesArgs,
): UnSyncedChanges {
  const { customTypes, libraries, slices, isOnline, authStatus } = args;

  const modelsStatuses = getModelStatus({
    slices,
    customTypes,
    isOnline,
    authStatus,
  });

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

  const changedSlices = unSyncedSlices
    .map((s) => ({
      slice: s,
      status: modelsStatuses.slices[s.model.id],
    }))
    .filter((s): s is ChangedSlice => unSyncStatuses.includes(s.status));
  const changedCustomTypes = unSyncedCustomTypes
    .map((model) => (hasLocal(model) ? model.local : model.remote))
    .map((ct) => ({
      customType: ct,
      status: modelsStatuses.customTypes[ct.id],
    }))
    .filter((c): c is ChangedCustomType => unSyncStatuses.includes(c.status));

  return {
    changedCustomTypes,
    changedSlices,
    unSyncedCustomTypes,
    unSyncedSlices,
    modelsStatuses,
  };
}

// ComponentUI are manipulated on all the relevant pages
// But the data is not available for remote only slices
// which have been deleted locally
// Should revisit this with the sync improvements
function wrapDeletedSlice(s: RemoteOnlySlice): ComponentUI {
  return {
    model: s.remote,
    screenshots: {},
    from: "",
    href: "",
    pathToSlice: "",
    fileName: "",
    extension: "",
  };
}

type GetModelStatusArgs = {
  slices: LocalOrRemoteSlice[];
  customTypes: LocalOrRemoteCustomType[];
  isOnline: boolean;
  authStatus: AuthStatus;
};

// Slices and Custom Types needs to be separated as Ids are not unique amongst each others.
export type ModelsStatuses = {
  slices: { [sliceId: string]: ModelStatus };
  customTypes: { [ctId: string]: ModelStatus };
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
