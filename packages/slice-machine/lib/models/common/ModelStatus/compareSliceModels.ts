import { Screenshot, SliceSM } from "@slicemachine/core/build/models";
import equal from "fast-deep-equal";
import { ModelStatus } from ".";

export type NewFrontEndSliceModel = {
  local: SliceSM;
  localScreenshots: Record<string, Screenshot>;
};

export type SyncedFrontEndSliceModel = {
  local: SliceSM;
  remote: SliceSM;
  localScreenshots: Record<string, Screenshot>;
};

export type LocalFrontEndSliceModel =
  | NewFrontEndSliceModel
  | SyncedFrontEndSliceModel;

export type DeletedFrontEndSliceModel = {
  local: undefined;
  remote: SliceSM;
  localScreenshots: Record<string, Screenshot>;
};

export type FrontEndSliceModel =
  | LocalFrontEndSliceModel
  | DeletedFrontEndSliceModel;

export const isLocalSlice = (
  s: FrontEndSliceModel
): s is LocalFrontEndSliceModel => s.local !== undefined;

export const isDeletedSlice = (
  s: FrontEndSliceModel
): s is DeletedFrontEndSliceModel => !isLocalSlice(s);

export const getSliceProp = <key extends keyof SliceSM>(
  s: FrontEndSliceModel,
  property: key
): SliceSM[key] => (isLocalSlice(s) ? s.local[property] : s.remote[property]);

export function compareSliceModels(
  models: Required<SyncedFrontEndSliceModel>
): ModelStatus {
  if (isDeletedSlice(models)) {
    return ModelStatus.Deleted;
  }

  const areScreenshotsEqual = compareScreenshots(
    models.remote,
    models.localScreenshots
  );
  if (!areScreenshotsEqual) {
    return ModelStatus.Modified;
  }
  const areModelsEquals = equal(
    stripImageUrl(models.local),
    stripImageUrl(models.remote)
  );

  if (!areModelsEquals) {
    return ModelStatus.Modified;
  }
  return ModelStatus.Synced;
}

const stripImageUrl = (slice: SliceSM) => ({
  ...slice,
  variations: slice.variations.map((v) => ({ ...v, imageUrl: undefined })),
});

function compareScreenshots(
  remoteModel: SliceSM,
  localScreenshots: Record<string, Screenshot>
) {
  return remoteModel.variations.every((variation) => {
    const localScreenshot = localScreenshots[variation.id];
    if (!variation.imageUrl && !localScreenshot) {
      return true;
    }
    if (variation.imageUrl?.includes(localScreenshot?.hash)) {
      return true;
    }
    return false;
  });
}
