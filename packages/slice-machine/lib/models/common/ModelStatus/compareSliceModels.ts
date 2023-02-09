import { Screenshot, SliceSM } from "@slicemachine/core/build/models";
import equal from "fast-deep-equal";
import { ModelStatus } from ".";
import { LocalAndRemoteSlice } from "../ModelData";

export function compareSliceModels(
  model: LocalAndRemoteSlice
):
  | { status: ModelStatus.Modified; model: LocalAndRemoteSlice }
  | { status: ModelStatus.Synced; model: LocalAndRemoteSlice } {
  const areScreenshotsEqual = compareScreenshots(
    model.remote,
    model.localScreenshots
  );
  if (!areScreenshotsEqual) return { status: ModelStatus.Modified, model };

  const areModelsEquals = equal(
    stripImageUrl(model.local),
    stripImageUrl(model.remote)
  );
  if (!areModelsEquals) return { status: ModelStatus.Modified, model };

  return { status: ModelStatus.Synced, model };
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
