import equal from "fast-deep-equal";
import { ModelStatus } from ".";
import { LocalAndRemoteCustomType } from "../ModelData";

export function compareCustomTypeLocalToRemote(
  model: LocalAndRemoteCustomType
): ModelStatus.Modified | ModelStatus.Synced {
  // If Custom Types are not equals then it was modified locally
  if (!equal(model.local, model.remote)) return ModelStatus.Modified;
  return ModelStatus.Synced;
}
