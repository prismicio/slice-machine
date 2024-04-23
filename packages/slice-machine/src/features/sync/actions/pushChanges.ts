import { PushChangesLimit } from "@slicemachine/manager";

import { pushChanges as pushChangesCall, telemetry } from "@/apiClient";
import {
  ChangedCustomType,
  ChangedSlice,
} from "@/legacy/lib/models/common/ModelStatus";

import { trackPushChangesSuccess } from "./trackPushChangesSuccess";

type PushChangesArgs = {
  changedSlices: ReadonlyArray<ChangedSlice>;
  changedCustomTypes: ReadonlyArray<ChangedCustomType>;
  confirmDeleteDocuments?: boolean;
};

export async function pushChanges(
  args: PushChangesArgs,
): Promise<PushChangesLimit | undefined> {
  const {
    changedSlices,
    changedCustomTypes,
    confirmDeleteDocuments = false,
  } = args;

  const startTime = Date.now();
  const sliceChanges = changedSlices.map((sliceChange) => ({
    id: sliceChange.slice.model.id,
    type: "Slice" as const,
    libraryID: sliceChange.slice.from,
    status: sliceChange.status,
  }));
  const customTypeChanges = changedCustomTypes.map((customTypeChange) => ({
    id: customTypeChange.customType.id,
    type: "CustomType" as const,
    status: customTypeChange.status,
  }));

  // Creating a new payload with the correct format
  const pushPayload = {
    confirmDeleteDocuments,
    changes: [...sliceChanges, ...customTypeChanges],
  };

  const response = await pushChangesCall(pushPayload);

  if (response) {
    // Tracking when a limit has been reached
    void telemetry.track({
      event: "changes:limit-reach",
      limitType: response.type,
    });

    return response;
  }

  trackPushChangesSuccess({
    changedCustomTypes,
    changedSlices,
    // Currently, we only pass confirmDeleteDocuments when the user
    // has confirmed the deletion of documents
    hasDeletedDocuments: confirmDeleteDocuments,
    startTime,
  });

  return undefined;
}
