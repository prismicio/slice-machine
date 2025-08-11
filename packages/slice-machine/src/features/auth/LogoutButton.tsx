import { Button, Icon, IconButton, Tooltip } from "@prismicio/editor-ui";
import { SX } from "@prismicio/editor-ui/dist/theme";
import * as Sentry from "@sentry/nextjs";
import { ReactNode } from "react";

import { clearAuth as managerLogout, getState } from "@/apiClient";
import { invalidateActiveEnvironmentData } from "@/features/environments/useActiveEnvironment";
import { invalidateEnvironmentsData } from "@/features/environments/useEnvironments";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

interface LogoutButtonProps {
  children?: ReactNode;
  onLogoutSuccess?: () => void;
  isLoading?: boolean;
  sx?: SX;
}

export function LogoutButton(props: LogoutButtonProps) {
  const { children, onLogoutSuccess, isLoading, sx } = props;

  const { refreshState } = useSliceMachineActions();

  async function onClick() {
    await managerLogout();

    const serverState = await getState();
    refreshState(serverState);

    Sentry.setUser({ id: serverState.env.shortId });

    // refresh queries to update the UI
    invalidateEnvironmentsData();
    invalidateActiveEnvironmentData();

    onLogoutSuccess?.();
  }

  if (children !== undefined) {
    return (
      <Button
        onClick={() => void onClick()}
        renderEndIcon={() => <Icon name="logout" size="extraSmall" />}
        color="grey"
        loading={isLoading}
        sx={sx}
      >
        {children}
      </Button>
    );
  }

  return (
    <Tooltip content="Log out" side="right">
      <IconButton
        icon="logout"
        onClick={() => void onClick()}
        hiddenLabel="Log out"
        loading={isLoading}
        sx={sx}
      />
    </Tooltip>
  );
}
