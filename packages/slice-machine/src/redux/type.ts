import { RouterState } from "connected-next-router/types";

import { AvailableCustomTypesStoreType } from "@/modules/availableCustomTypes/types";
import { EnvironmentStoreType } from "@/modules/environment/types";
import { LoadingStoreType } from "@/modules/loading/types";
import { ModalStoreType } from "@/modules/modal/types";
import { SlicesStoreType } from "@/modules/slices/types";
import { UserContextStoreType } from "@/modules/userContext/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
  userContext: UserContextStoreType;
  environment: EnvironmentStoreType;
  availableCustomTypes: AvailableCustomTypesStoreType;
  slices: SlicesStoreType;
  router: RouterState;
};
