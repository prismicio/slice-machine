import {
  computeModelStatus,
  FrontEndModel,
  ModelStatus,
} from "@lib/models/common/ModelStatus";
import { getAuthStatus } from "@src/modules/environment";
import { AuthStatus } from "@src/modules/userContext/types";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";
import { useNetwork } from "./useNetwork";

// Slices and Custom Types needs to be separated as Ids are not unique amongst each others.
export interface ModelStatusInformation {
  modelsStatuses: {
    slices: { [sliceId: string]: ModelStatus };
    customTypes: { [ctId: string]: ModelStatus };
  };
  authStatus: AuthStatus;
  isOnline: boolean;
}

export const useModelStatus = (
  models: FrontEndModel[]
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
      (acc: ModelStatusInformation["modelsStatuses"], model: FrontEndModel) => {
        const status: ModelStatus = computeModelStatus(
          model,
          userHasAccessToModels
        );

        if ("localScreenshots" in model) {
          return {
            slices: {
              ...acc.slices,
              [model.local.id]: status,
            },
            customTypes: acc.customTypes,
          };
        }

        return {
          slices: acc.slices,
          customTypes: {
            ...acc.customTypes,
            [model.local.id]: status,
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
