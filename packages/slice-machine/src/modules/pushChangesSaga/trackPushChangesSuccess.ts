import Tracker from "@src/tracking/client";
import { ChangesPushSagaPayload } from ".";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { ModelStatus } from "@lib/models/common/ModelStatus";

type trackingParameters = ChangesPushSagaPayload & { startTime: number };

export async function trackPushChangesSuccess(params: trackingParameters) {
  const {
    startTime,
    confirmDeleteDocuments,
    unSyncedCustomTypes,
    unSyncedSlices,
    modelsStatuses,
  } = params;

  const customTypesStats = unSyncedCustomTypes.reduce<{
    customTypesCreated: number;
    customTypesModified: number;
    customTypesDeleted: number;
  }>(
    (acc, customType) => {
      const status = modelsStatuses.customTypes[customType.id];
      if (status === ModelStatus.New)
        return {
          ...acc,
          customTypesCreated: acc.customTypesCreated + 1,
        };
      else if (status === ModelStatus.Modified)
        return {
          ...acc,
          customTypesModified: acc.customTypesModified + 1,
        };
      else if (status === ModelStatus.Deleted)
        return {
          ...acc,
          customTypesDeleted: acc.customTypesDeleted + 1,
        };
      else return acc;
    },
    {
      customTypesCreated: 0,
      customTypesModified: 0,
      customTypesDeleted: 0,
    }
  );

  const slicesStats = unSyncedSlices.reduce<{
    slicesCreated: number;
    slicesModified: number;
    slicesDeleted: number;
  }>(
    (acc, slice) => {
      const status = modelsStatuses.slices[slice.model.id];
      if (status === ModelStatus.New)
        return {
          ...acc,
          slicesCreated: acc.slicesCreated + 1,
        };
      else if (status === ModelStatus.Modified)
        return {
          ...acc,
          slicesModified: acc.slicesModified + 1,
        };
      else if (status === ModelStatus.Deleted)
        return {
          ...acc,
          slicesDeleted: acc.slicesDeleted + 1,
        };
      else return acc;
    },
    {
      slicesCreated: 0,
      slicesModified: 0,
      slicesDeleted: 0,
    }
  );

  const total = unSyncedSlices.length + unSyncedCustomTypes.length;
  const missingScreenshots: number = unSyncedSlices.reduce(
    (sum: number, slice: ComponentUI) => sum + countMissingScreenshots(slice),
    0
  );
  const duration = Date.now() - startTime;

  return Tracker.get().trackChangesPushed({
    customTypesCreated: customTypesStats.customTypesCreated,
    customTypesModified: customTypesStats.customTypesModified,
    customTypesDeleted: customTypesStats.customTypesDeleted,
    slicesCreated: slicesStats.slicesCreated,
    slicesModified: slicesStats.slicesModified,
    slicesDeleted: slicesStats.slicesDeleted,
    total: total,
    missingScreenshots,
    duration: duration,
    hasDeletedDocuments: confirmDeleteDocuments,
  });
}
