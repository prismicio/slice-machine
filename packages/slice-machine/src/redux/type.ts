import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { LoadingStoreType } from "@src/modules/loading/types";
import { ModalStoreType } from "@src/modules/modal/types";
import { SlicesStoreType } from "@src/modules/slices/types";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { RouterState } from "connected-next-router/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
  userContext: UserContextStoreType;
  environment: EnvironmentStoreType;
  availableCustomTypes: AvailableCustomTypesStoreType;
  slices: SlicesStoreType;
  router: RouterState;
};
