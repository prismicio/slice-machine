import { SliceMachineStoreType } from "@src/redux/type";
import { initialState } from "./reducer";

export function findModelErrors(store: SliceMachineStoreType) {
  return store.modelErrors || initialState;
}
