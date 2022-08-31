import equal from "fast-deep-equal";
import { SliceSM } from "@slicemachine/core/build/models/Slice";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

export enum ModelStatus {
  New = "NEW", // new model that does not exist in the repo
  Modified = "MODIFIED", // model that exist both remote and locally but has modifications locally
  Synced = "SYNCED", // model that exist both remote and locally with no modifications
  Unknown = "UNKNOWN", // unable to detect the status of a model
}

export type FrontEndModel =
  | { local: SliceSM; remote?: SliceSM }
  | { local: CustomTypeSM; remote?: CustomTypeSM };

export function computeModelStatus(
  models: FrontEndModel,
  userHasAccessToPrismic: boolean
): ModelStatus {
  // If the user doesn't have access to Prismic models for any reason then we can't compare models properly
  if (!userHasAccessToPrismic) return ModelStatus.Unknown;

  // If there is no remote model then it's a new model created locally waiting to be pushed
  if (!models.remote) return ModelStatus.New;

  // If the models are not equals then it was modified locally
  if (!equal(models.local, models.remote)) return ModelStatus.Modified;

  return ModelStatus.Synced;
}
