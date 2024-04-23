import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { getFrontendSlices, getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import { useAuthStatus } from "@src/hooks/useAuthStatus";

import { useNetwork } from "../../hooks/useNetwork";
import { UnSyncedChanges, getUnSyncedChanges } from "./getUnSyncChanges";

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
