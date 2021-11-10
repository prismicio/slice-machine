import { ModalStoreType } from "@src/modules/modal/modal";
import { LoadingStoreType } from "@src/modules/loading/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
};
