import equal from "fast-deep-equal";
import { SliceSM } from "@slicemachine/core/build/models/Slice";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { Screenshot } from "@slicemachine/core/build/models/Library";
import { ComponentUI } from "./ComponentUI";

export enum ModelStatus {
  New = "NEW", // new model that does not exist in the repo
  Modified = "MODIFIED", // model that exist both remote and locally but has modifications locally
  Synced = "SYNCED", // model that exist both remote and locally with no modifications
  Unknown = "UNKNOWN", // unable to detect the status of a model
}

function stripImageUrl(slice: SliceSM): SliceSM {
  return {
    ...slice,
    variations: slice.variations.map((v) => ({ ...v, imageUrl: undefined })),
  };
}

function areScreenshotsEqual(
  localScreenshots: Record<string, Screenshot>,
  remoteModel: SliceSM | undefined
) {
  return remoteModel?.variations.every((variation) => {
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

export type FrontEndSliceModel = {
  local: SliceSM;
  remote?: SliceSM;
  component: ComponentUI;
};
export type FrontEndCtModel = { local: CustomTypeSM; remote?: CustomTypeSM };
export type FrontEndModel = FrontEndSliceModel | FrontEndCtModel;

function handleCommonStatus(
  model: SliceSM | CustomTypeSM | undefined,
  userHasAccessToPrismic: boolean
) {
  // If the user doesn't have access to Prismic models for any reason then we can't compare models properly
  if (!userHasAccessToPrismic) return ModelStatus.Unknown;

  // If there is no remote model then it's a new model created locally waiting to be pushed
  if (!model) return ModelStatus.New;
}

export function computeSliceModelStatus(
  models: FrontEndSliceModel,
  userHasAccessToPrismic: boolean
): ModelStatus {
  const maybeCommonStatus = handleCommonStatus(
    models.remote,
    userHasAccessToPrismic
  );
  if (maybeCommonStatus) {
    return maybeCommonStatus;
  }
  const { local, remote, component } = models;
  if (
    !equal(stripImageUrl(local), stripImageUrl(remote!)) ||
    !areScreenshotsEqual(component.screenshots, remote)
  )
    return ModelStatus.Modified;

  return ModelStatus.Synced;
}

export function computeCustomTypeModelStatus(
  models: FrontEndCtModel,
  userHasAccessToPrismic: boolean
): ModelStatus {
  const maybeCommonStatus = handleCommonStatus(
    models.remote,
    userHasAccessToPrismic
  );
  if (maybeCommonStatus) {
    return maybeCommonStatus;
  }
  // If Custom Types are not equals then it was modified locally
  const { local, remote } = models;
  if (!equal(local, remote)) {
    return ModelStatus.Modified;
  }

  return ModelStatus.Synced;
}
