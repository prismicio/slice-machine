import equal from "fast-deep-equal";

import { LocalAndRemoteCustomType } from "../ModelData";
import { ModelStatus } from ".";

export function compareCustomTypeLocalToRemote(
  model: LocalAndRemoteCustomType,
): ModelStatus.Modified | ModelStatus.Synced {
  // If Custom Types are not equals then it was modified locally
  if (!equal(model.local, model.remote)) return ModelStatus.Modified;
  return ModelStatus.Synced;
}
