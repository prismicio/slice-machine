import { normalizeFrontendCustomTypes } from "@lib/models/common/normalizers/customType";
import { normalizeFrontendSlices } from "@lib/models/common/normalizers/slices";
import { getState } from "@src/apiClient";
import { AuthStatus } from "@src/modules/userContext/types";

import { UnSyncedChanges, getUnSyncedChanges } from "./getUnSyncChanges";

type FetchUnSyncChangesArgs = {
  isOnline: boolean;
  authStatus: AuthStatus;
};

export async function fetchUnSyncChanges(
  args: FetchUnSyncChangesArgs,
): Promise<UnSyncedChanges> {
  const { isOnline, authStatus } = args;

  const serverState = await getState();

  const slices = normalizeFrontendSlices(
    serverState.libraries,
    serverState.remoteSlices,
  );
  const customTypes = Object.values(
    normalizeFrontendCustomTypes(
      serverState.customTypes,
      serverState.remoteCustomTypes,
    ),
  );

  const unSyncedChanges = getUnSyncedChanges({
    customTypes,
    libraries: serverState.libraries,
    slices,
    isOnline,
    authStatus,
  });

  return unSyncedChanges;
}
