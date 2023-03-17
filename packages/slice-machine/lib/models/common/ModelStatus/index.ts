import { compareCustomTypeLocalToRemote } from "./compareCustomTypeModels";
import { compareSliceLocalToRemote } from "./compareSliceModels";
import {
  type LocalOrRemoteCustomType,
  type LocalOrRemoteSlice,
  type LocalOrRemoteModel,
  type LocalAndRemoteCustomType,
  type LocalAndRemoteSlice,
  type LocalOnlyCustomType,
  type LocalOnlySlice,
  type RemoteOnlyCustomType,
  type RemoteOnlySlice,
  hasLocal,
  hasRemote,
} from "../ModelData";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeSM } from "@lib/models/common/CustomType";

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
  model: LocalAndRemoteSlice | LocalAndRemoteCustomType
): model is LocalAndRemoteSlice => {
  return "variations" in model.local && "variations" in model.remote;
};

export function computeModelStatus(
  model: LocalOrRemoteSlice,
  userHasAccessToPrismic: boolean
):
  | { status: ModelStatus.Unknown; model: LocalOrRemoteSlice }
  | { status: ModelStatus.Deleted; model: RemoteOnlySlice }
  | { status: ModelStatus.New; model: LocalOnlySlice }
  | { status: ModelStatus.Modified; model: LocalAndRemoteSlice }
  | { status: ModelStatus.Synced; model: LocalAndRemoteSlice };

export function computeModelStatus(
  model: LocalOrRemoteCustomType,
  userHasAccessToPrismic: boolean
):
  | { status: ModelStatus.Unknown; model: LocalOrRemoteCustomType }
  | { status: ModelStatus.Deleted; model: RemoteOnlyCustomType }
  | { status: ModelStatus.New; model: LocalOnlyCustomType }
  | { status: ModelStatus.Modified; model: LocalAndRemoteCustomType }
  | { status: ModelStatus.Synced; model: LocalAndRemoteCustomType };

export function computeModelStatus(
  model: LocalOrRemoteModel,
  userHasAccessToPrismic: boolean
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
  userHasAccessToPrismic: boolean
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
