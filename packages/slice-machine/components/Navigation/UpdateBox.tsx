import { FC } from "react";
import Link from "next/link";

import { useUpdateAvailable } from "@src/hooks/useUpdateAvailable";
import { UpdateInfo } from "@src/components/SideNav";

export const UpdateBox: FC = () => {
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  if (!sliceMachineUpdateAvailable && !adapterUpdateAvailable) {
    return null;
  }

  return <UpdateInfo href="/changelog" component={Link} />;
};
