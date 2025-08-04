import { IconButton, Tooltip } from "@prismicio/editor-ui";
import { toast } from "react-toastify";

import { logout } from "@/apiClient";
import { invalidateActiveEnvironmentData } from "@/features/environments/useActiveEnvironment";
import { invalidateEnvironmentsData } from "@/features/environments/useEnvironments";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

export function LogoutButton() {
  const { clearAuthStatus, clearRemoteCustomTypes, clearRemoteSlices } =
    useSliceMachineActions();

  async function onClick() {
    await logout();
    clearAuthStatus();
    clearRemoteCustomTypes();
    clearRemoteSlices();
    invalidateEnvironmentsData();
    invalidateActiveEnvironmentData();
    toast.success("Logged out");
  }

  return (
    <Tooltip content="Log out" side="right">
      <IconButton icon="logout" onClick={() => void onClick()} />
    </Tooltip>
  );
}
