import { useSelector } from "react-redux";

import { getAuthStatus } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

export function useAuthStatus() {
  const { authStatus } = useSelector((store: SliceMachineStoreType) => ({
    authStatus: getAuthStatus(store),
  }));

  return authStatus;
}
