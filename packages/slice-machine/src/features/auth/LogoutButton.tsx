import { IconButton, Tooltip } from "@prismicio/editor-ui";
import { toast } from "react-toastify";

import { clearAuth as managerLogout, getState } from "@/apiClient";
import { invalidateActiveEnvironmentData } from "@/features/environments/useActiveEnvironment";
import { invalidateEnvironmentsData } from "@/features/environments/useEnvironments";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

export function LogoutButton() {
  const { refreshState } = useSliceMachineActions();

  async function onClick() {
    await managerLogout();

    refreshState(await getState());

    // refresh queries to update the UI
    invalidateEnvironmentsData();
    invalidateActiveEnvironmentData();

    toast.success("Logged out");
  }

  return (
    <Tooltip content="Log out" side="right">
      <IconButton
        icon="logout"
        onClick={() => void onClick()}
        hiddenLabel="Log out"
      />
    </Tooltip>
  );
}
