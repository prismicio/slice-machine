import {
  FrontEndCustomType,
  SyncedCustomType,
} from "@src/modules/availableCustomTypes/types";
import equal from "fast-deep-equal";
import { ModelStatus } from ".";

export type FrontEndCtModel = FrontEndCustomType;

export function compareCustomTypeModels(models: SyncedCustomType) {
  // If Custom Types are not equals then it was modified locally
  if (!equal(models.local, models.remote)) {
    return ModelStatus.Modified;
  }

  return ModelStatus.Synced;
}
