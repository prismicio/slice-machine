import { ModalStoreType } from "@src/modules/modal/modal";
import { LoadingStoreType } from "@src/modules/loading/types";
import { UserContextStoreType } from "@src/modules/userContext/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
  userContext: UserContextStoreType;
};
