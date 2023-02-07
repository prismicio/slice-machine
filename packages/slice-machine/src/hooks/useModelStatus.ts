import {
  computeModelStatus,
  ModelStatus,
} from "@lib/models/common/ModelStatus";
import { getAuthStatus } from "@src/modules/environment";
import { AuthStatus } from "@src/modules/userContext/types";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";
import { useNetwork } from "./useNetwork";
import {
  getModelId,
  hasLocal,
  LocalOrRemoteCustomType,
  LocalOrRemoteModel,
  LocalOrRemoteSlice,
} from "@lib/models/common/ModelData";
import { mode } from "@prismicio/editor-ui/dist/theme/mode.css";

// Slices and Custom Types needs to be separated as Ids are not unique amongst each others.
export interface ModelStatusInformation {
  modelsStatuses: {
    slices: { [sliceId: string]: ModelStatus };
    customTypes: { [ctId: string]: ModelStatus };
  };
  authStatus: AuthStatus;
  isOnline: boolean;
}

// THIS DOES NOT WORK
const isSliceModel = (m: LocalOrRemoteModel): m is LocalOrRemoteSlice =>
  "localScreenshots" in m;

export const useModelStatus = (
  models: LocalOrRemoteModel[]
): ModelStatusInformation => {
  const isOnline = useNetwork();
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));
  const userHasAccessToModels =
    isOnline &&
    authStatus != AuthStatus.FORBIDDEN &&
    authStatus != AuthStatus.UNAUTHORIZED;

  const modelsStatuses: ModelStatusInformation["modelsStatuses"] =
    models.reduce(
      (
        acc: ModelStatusInformation["modelsStatuses"],
        model: LocalOrRemoteModel
      ) => {
        const { status } = computeModelStatus(model, userHasAccessToModels);

        if (isSliceModel(model)) {
          return {
            slices: {
              ...acc.slices,
              [getModelId(model)]: status,
            },
            customTypes: acc.customTypes,
          };
        }

        return {
          slices: acc.slices,
          customTypes: {
            ...acc.customTypes,
            [getModelId(model)]: status,
          },
        };
      },
      { slices: {}, customTypes: {} }
    );

  return {
    modelsStatuses,
    authStatus,
    isOnline,
  };
};

function computeStatuses(
  models: LocalOrRemoteCustomType[],
  userHasAccessToModels: boolean
): { [sliceId: string]: ModelStatus };
function computeStatuses(
  models: LocalOrRemoteSlice[],
  userHasAccessToModels: boolean
): { [sliceId: string]: ModelStatus };
function computeStatuses(
  models: LocalOrRemoteModel[],
  userHasAccessToModels: boolean
) {
  return models.reduce<{ [id: string]: ModelStatus }>((acc, model) => {
    const { status } = computeModelStatus(model, userHasAccessToModels);

    return {
      ...acc,
      [hasLocal(model) ? model.local.id : model.remote.id]: status,
    };
  }, {} as { [sliceId: string]: ModelStatus });
}

export const useModelStatus2 = ({
  slices = [],
  customTypes = [],
}: {
  slices: LocalOrRemoteSlice[];
  customTypes: LocalOrRemoteCustomType[];
}): ModelStatusInformation => {
  const isOnline = useNetwork();
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));
  const userHasAccessToModels =
    isOnline &&
    authStatus != AuthStatus.FORBIDDEN &&
    authStatus != AuthStatus.UNAUTHORIZED;

  const modelsStatuses = {
    slices: computeStatuses(slices, userHasAccessToModels),
    customTypes: computeStatuses(customTypes, userHasAccessToModels),
  };

  return {
    modelsStatuses,
    authStatus,
    isOnline,
  };
};
