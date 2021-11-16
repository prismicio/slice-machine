import { ModalStoreType } from "@src/modules/modal/types";
import { LoadingStoreType } from "@src/modules/loading/types";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { EnvironmentStoreType } from "@src/modules/environment/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
  userContext: UserContextStoreType;
  environment: EnvironmentStoreType;
};
