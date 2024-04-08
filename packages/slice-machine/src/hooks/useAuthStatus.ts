import { getAuthStatus } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";

export function useAuthStatus() {
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));

  return authStatus;
}
