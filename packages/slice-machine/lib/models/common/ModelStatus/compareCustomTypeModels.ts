import equal from "fast-deep-equal";
import { ModelStatus } from ".";
import { LocalAndRemoteCustomType } from "../ModelData";

export function compareCustomTypeModels(
  model: LocalAndRemoteCustomType
):
  | { status: ModelStatus.Modified; model: LocalAndRemoteCustomType }
  | { status: ModelStatus.Synced; model: LocalAndRemoteCustomType } {
  // If Custom Types are not equals then it was modified locally
  if (!equal(model.local, model.remote))
    return { status: ModelStatus.Modified, model };
  return { status: ModelStatus.Synced, model };
}
