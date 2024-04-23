import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";

import {
  hasLocal,
  hasRemote,
  type LocalAndRemoteCustomType,
  type LocalAndRemoteSlice,
  type LocalOnlyCustomType,
  type LocalOnlySlice,
  type LocalOrRemoteCustomType,
  type LocalOrRemoteModel,
  type LocalOrRemoteSlice,
  type RemoteOnlyCustomType,
  type RemoteOnlySlice,
} from "../ModelData";
import { compareCustomTypeLocalToRemote } from "./compareCustomTypeModels";
import { compareSliceLocalToRemote } from "./compareSliceModels";

export enum ModelStatus {
  New = "NEW", // new model that does not exist in the repo
  Modified = "MODIFIED", // model that exist both remote and locally but has modifications locally
  Synced = "SYNCED", // model that exist both remote and locally with no modifications
  Deleted = "DELETED", // model that exist remotely but not locally
  Unknown = "UNKNOWN", // unable to detect the status of a model
}

export type ChangesStatus =
  | ModelStatus.Deleted
  | ModelStatus.New
  | ModelStatus.Modified;

export type ChangedSlice = { status: ChangesStatus; slice: ComponentUI };
export type ChangedCustomType = {
  status: ChangesStatus;
  customType: CustomTypeSM;
};

const isSliceModel = (
  model: LocalAndRemoteSlice | LocalAndRemoteCustomType,
): model is LocalAndRemoteSlice => {
  return "variations" in model.local && "variations" in model.remote;
};

export function computeModelStatus(
  model: LocalOrRemoteSlice,
  userHasAccessToPrismic: boolean,
):
  | { status: ModelStatus.Unknown; model: LocalOrRemoteSlice }
  | { status: ModelStatus.Deleted; model: RemoteOnlySlice }
  | { status: ModelStatus.New; model: LocalOnlySlice }
  | { status: ModelStatus.Modified; model: LocalAndRemoteSlice }
  | { status: ModelStatus.Synced; model: LocalAndRemoteSlice };

export function computeModelStatus(
  model: LocalOrRemoteCustomType,
  userHasAccessToPrismic: boolean,
):
  | { status: ModelStatus.Unknown; model: LocalOrRemoteCustomType }
  | { status: ModelStatus.Deleted; model: RemoteOnlyCustomType }
  | { status: ModelStatus.New; model: LocalOnlyCustomType }
  | { status: ModelStatus.Modified; model: LocalAndRemoteCustomType }
  | { status: ModelStatus.Synced; model: LocalAndRemoteCustomType };

export function computeModelStatus(
  model: LocalOrRemoteModel,
  userHasAccessToPrismic: boolean,
):
  | {
      status: ModelStatus.Unknown;
      model: LocalOrRemoteSlice | LocalOrRemoteCustomType;
    }
  | {
      status: ModelStatus.Deleted;
      model: RemoteOnlySlice | RemoteOnlyCustomType;
    }
  | { status: ModelStatus.New; model: LocalOnlySlice | LocalOnlyCustomType }
  | {
      status: ModelStatus.Modified;
      model: LocalAndRemoteSlice | LocalAndRemoteCustomType;
    }
  | {
      status: ModelStatus.Synced;
      model: LocalAndRemoteSlice | LocalAndRemoteCustomType;
    };

export function computeModelStatus(
  model: LocalOrRemoteModel,
  userHasAccessToPrismic: boolean,
):
  | {
      status: ModelStatus.Unknown;
      model: LocalOrRemoteSlice | LocalOrRemoteCustomType;
    }
  | {
      status: ModelStatus.Deleted;
      model: RemoteOnlySlice | RemoteOnlyCustomType;
    }
  | { status: ModelStatus.New; model: LocalOnlySlice | LocalOnlyCustomType }
  | {
      status: ModelStatus.Modified;
      model: LocalAndRemoteSlice | LocalAndRemoteCustomType;
    }
  | {
      status: ModelStatus.Synced;
      model: LocalAndRemoteSlice | LocalAndRemoteCustomType;
    } {
  if (!userHasAccessToPrismic) return { status: ModelStatus.Unknown, model };

  // If there's no local model then it's a model deleted locally waiting to be pushed
  if (!hasLocal(model)) return { status: ModelStatus.Deleted, model };

  // If there is no remote model then it's a new model created locally waiting to be pushed
  if (!hasRemote(model)) return { status: ModelStatus.New, model };

  const status = isSliceModel(model)
    ? compareSliceLocalToRemote(model)
    : compareCustomTypeLocalToRemote(model);
  return { status, model };
}

export function computeStatuses(
  models: LocalOrRemoteCustomType[],
  userHasAccessToModels: boolean,
): { [sliceId: string]: ModelStatus };
export function computeStatuses(
  models: LocalOrRemoteSlice[],
  userHasAccessToModels: boolean,
): { [sliceId: string]: ModelStatus };
export function computeStatuses(
  models: LocalOrRemoteModel[],
  userHasAccessToModels: boolean,
) {
  return models.reduce<{ [id: string]: ModelStatus }>(
    (acc, model) => {
      const { status } = computeModelStatus(model, userHasAccessToModels);

      return {
        ...acc,
        [hasLocal(model) ? model.local.id : model.remote.id]: status,
      };
    },
    {} as { [sliceId: string]: ModelStatus },
  );
}
