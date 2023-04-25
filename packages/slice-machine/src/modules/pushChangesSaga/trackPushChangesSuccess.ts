import { ChangesPushSagaPayload } from ".";
import { telemetry } from "@src/apiClient";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { ModelStatus } from "@lib/models/common/ModelStatus";

type trackingParameters = ChangesPushSagaPayload & { startTime: number };

export function trackPushChangesSuccess(params: trackingParameters) {
  const {
    startTime,
    confirmDeleteDocuments,
    changedCustomTypes,
    changedSlices,
  } = params;

  const customTypesStats = changedCustomTypes.reduce<{
    customTypesCreated: number;
    customTypesModified: number;
    customTypesDeleted: number;
  }>(
    (acc, customType) => {
      if (customType.status === ModelStatus.New)
        return {
          ...acc,
          customTypesCreated: acc.customTypesCreated + 1,
        };
      else if (customType.status === ModelStatus.Modified)
        return {
          ...acc,
          customTypesModified: acc.customTypesModified + 1,
        };
      else if (customType.status === ModelStatus.Deleted)
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

  const slicesStats = changedSlices.reduce<{
    slicesCreated: number;
    slicesModified: number;
    slicesDeleted: number;
  }>(
    (acc, slice) => {
      if (slice.status === ModelStatus.New)
        return {
          ...acc,
          slicesCreated: acc.slicesCreated + 1,
        };
      else if (slice.status === ModelStatus.Modified)
        return {
          ...acc,
          slicesModified: acc.slicesModified + 1,
        };
      else if (slice.status === ModelStatus.Deleted)
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

  const total = changedSlices.length + changedCustomTypes.length;
  const missingScreenshots: number = changedSlices.reduce(
    (sum, sliceChange) => sum + countMissingScreenshots(sliceChange.slice),
    0
  );
  const duration = Date.now() - startTime;

  return telemetry.track({
    event: "changes:pushed",
    ...customTypesStats,
    ...slicesStats,
    total: total,
    missingScreenshots,
    duration: duration,
    hasDeletedDocuments: confirmDeleteDocuments,
  });
}
