import { UpdateInfo } from "@src/components/SideNav";
import { useUpdateAvailable } from "@src/hooks/useUpdateAvailable";
import Link from "next/link";
import { FC } from "react";

export const UpdateBox: FC = () => {
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  if (!sliceMachineUpdateAvailable && !adapterUpdateAvailable) {
    return null;
  }

  return <UpdateInfo href="/changelog" component={Link} />;
};
