import { FC } from "react";

import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { RightElement } from "@src/components/SideNav/SideNav";
import { AuthStatus } from "@src/modules/userContext/types";
import { useNetwork } from "@src/hooks/useNetwork";

export const ChangesRightElement: FC = () => {
  const isOnline = useNetwork();
  const { unSyncedSlices, unSyncedCustomTypes, authStatus } =
    useUnSyncChanges();
  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  if (
    !isOnline ||
    authStatus === AuthStatus.UNAUTHORIZED ||
    authStatus === AuthStatus.FORBIDDEN
  ) {
    return <RightElement>Logged out</RightElement>;
  }

  if (numberOfChanges === 0) {
    return null;
  }

  const formattedNumberOfChanges = numberOfChanges > 9 ? "+9" : numberOfChanges;

  return (
    <RightElement type="pill" data-cy="changes-number">
      {formattedNumberOfChanges}
    </RightElement>
  );
};
