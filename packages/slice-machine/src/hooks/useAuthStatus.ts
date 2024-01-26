import { useSelector } from "react-redux";

import { getAuthStatus } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";

export function useAuthStatus() {
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));

  return authStatus;
}
