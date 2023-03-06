import equal from "fast-deep-equal";
import { Screenshot } from "../Library";
import { SliceSM } from "../Slice";
import { ModelStatus } from ".";
import { LocalAndRemoteSlice } from "../ModelData";

export function compareSliceLocalToRemote(
  model: LocalAndRemoteSlice
): ModelStatus.Modified | ModelStatus.Synced {
  const areScreenshotsEqual = compareScreenshots(
    model.remote,
    model.localScreenshots
  );
  if (!areScreenshotsEqual) return ModelStatus.Modified;

  const areModelsEquals = equal(
    stripImageUrl(model.local),
    stripImageUrl(model.remote)
  );
  if (!areModelsEquals) return ModelStatus.Modified;

  return ModelStatus.Synced;
}

const stripImageUrl = (slice: SliceSM) => ({
  ...slice,
  variations: slice.variations.map((v) => ({ ...v, imageUrl: undefined })),
});

export function compareScreenshots(
  remoteModel: SliceSM,
  localScreenshots: Partial<Record<string, Screenshot>>
) {
  return remoteModel.variations.every((variation) => {
    const localScreenshotHash = localScreenshots[variation.id]?.hash;
    const remoteScreenshotUrl = variation.imageUrl;

    if (localScreenshotHash === undefined) {
      return remoteScreenshotUrl === undefined;
    } else {
      return remoteScreenshotUrl?.includes(localScreenshotHash);
    }
  });
}
