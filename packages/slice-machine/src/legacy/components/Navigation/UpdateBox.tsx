import Link from "next/link";
import { FC } from "react";

import { UpdateInfo } from "@/components/SideNav";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

export const UpdateBox: FC = () => {
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  if (!sliceMachineUpdateAvailable && !adapterUpdateAvailable) {
    return null;
  }

  return <UpdateInfo href="/changelog" component={Link} />;
};
