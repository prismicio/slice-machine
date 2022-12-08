import { compareSliceModels, FrontEndSliceModel } from "./compareSliceModels";
import {
  compareCustomTypeModels,
  FrontEndCtModel,
} from "./compareCustomTypeModels";

export enum ModelStatus {
  New = "NEW", // new model that does not exist in the repo
  Modified = "MODIFIED", // model that exist both remote and locally but has modifications locally
  Synced = "SYNCED", // model that exist both remote and locally with no modifications
  Deleted = "DELETED", // model that exist remotely but not locally
  Unknown = "UNKNOWN", // unable to detect the status of a model
}

export type FrontEndModel = FrontEndSliceModel | FrontEndCtModel;

export function computeModelStatus(
  models: FrontEndModel,
  userHasAccessToPrismic: boolean
): ModelStatus {
  // If the user doesn't have access to Prismic models for any reason then we can't compare models properly
  if (!userHasAccessToPrismic) return ModelStatus.Unknown;

  // If there's no local model then it's a model deleted locally waiting to be pushed
  // TODO Models created by someone else will be handled in the next iteration
  if (!models.local) return ModelStatus.Deleted;

  // If there is no remote model then it's a new model created locally waiting to be pushed
  if (!("remote" in models) || !models.remote) return ModelStatus.New;

  if ("localScreenshots" in models) return compareSliceModels(models);
  return compareCustomTypeModels(models);
}
