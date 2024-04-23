import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";
import { getFrontendSlices, getLibraries } from "@/modules/slices";
import { SliceMachineStoreType } from "@/redux/type";

import { useNetwork } from "../../hooks/useNetwork";
import { getUnSyncedChanges, UnSyncedChanges } from "./getUnSyncChanges";

export const useUnSyncChanges = (): UnSyncedChanges => {
  const { customTypes, slices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectAllCustomTypes(store),
      slices: getFrontendSlices(store),
      libraries: getLibraries(store),
    }),
  );
  const isOnline = useNetwork();
  const authStatus = useAuthStatus();

  const unSyncedChange = getUnSyncedChanges({
    authStatus,
    customTypes,
    isOnline,
    libraries,
    slices,
  });

  return useMemo(() => unSyncedChange, [unSyncedChange]);
};
