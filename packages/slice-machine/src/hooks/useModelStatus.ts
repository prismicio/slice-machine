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

// Slices and Custom Types needs to be separated as Ids are not unique with each others.
type ModelsStatuses = {
  slices: { [sliceId: string]: ModelStatus };
  customTypes: { [ctId: string]: ModelStatus };
};

export const useModelStatus = (
  models: FrontEndModel[]
): {
  modelsStatuses: ModelsStatuses;
  authStatus: AuthStatus;
  isOnline: boolean;
} => {
  const isOnline = useNetwork();
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));
  const userHasAccessToModels =
    isOnline &&
    authStatus != AuthStatus.FORBIDDEN &&
    authStatus != AuthStatus.UNAUTHORIZED;

  const modelsStatuses: ModelsStatuses = models.reduce(
    (acc: ModelsStatuses, model: FrontEndModel) => {
      const status: ModelStatus = computeModelStatus(
        model,
        userHasAccessToModels
      );
      const modelIsSlice = "variations" in model.local;

      if (modelIsSlice) {
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
