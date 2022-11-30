import {
  computeModelStatus,
  FrontEndModel,
  ModelStatus,
} from "@lib/models/common/ModelStatus";
import { FrontEndSliceModel } from "@lib/models/common/ModelStatus/compareSliceModels";
import { getCustomTypeProp } from "@src/modules/availableCustomTypes/types";
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

const isSliceModel = (m: FrontEndModel): m is FrontEndSliceModel =>
  "localScreenshots" in m;

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

        if (isSliceModel(model)) {
          return {
            slices: {
              ...acc.slices,
              // Can we move the `id` field up? Or type better (either local or remote has to be defined)
              [model.local?.id ??
              model.remote?.id ??
              "this-should-never-happen"]: status,
            },
            customTypes: acc.customTypes,
          };
        }

        return {
          slices: acc.slices,
          customTypes: {
            ...acc.customTypes,
            [getCustomTypeProp(model, "id")]: status,
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
