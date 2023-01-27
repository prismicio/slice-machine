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
  LocalOrRemoteModel,
  LocalOrRemoteSlice,
} from "@lib/models/common/ModelData";

// Slices and Custom Types needs to be separated as Ids are not unique amongst each others.
export interface ModelStatusInformation {
  modelsStatuses: {
    slices: { [sliceId: string]: ModelStatus };
    customTypes: { [ctId: string]: ModelStatus };
  };
  authStatus: AuthStatus;
  isOnline: boolean;
}

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
