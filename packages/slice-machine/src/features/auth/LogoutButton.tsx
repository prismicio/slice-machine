import { Button, Icon, IconButton, Tooltip } from "@prismicio/editor-ui";
import { SX } from "@prismicio/editor-ui/dist/theme";
import * as Sentry from "@sentry/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

import { clearAuth as managerLogout, getState } from "@/apiClient";
import { GetActiveEnvironmentQueryKey } from "@/features/environments/useActiveEnvironment";
import { GetEnvironmentsQueryKey } from "@/features/environments/useEnvironments";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

interface LogoutButtonProps {
  children?: ReactNode;
  onLogoutSuccess?: () => void;
  /** Whether to, after logging out, invalidate queries that are currently
   * dependent on the state of authentication.
   * @default true */
  invalidateOnSuccess?: boolean;
  sx?: SX;
}

export function LogoutButton(props: LogoutButtonProps) {
  const { children, onLogoutSuccess, invalidateOnSuccess = true, sx } = props;

  const { refreshState } = useSliceMachineActions();
  const queryClient = useQueryClient();

  async function onClick() {
    await managerLogout();

    const serverState = await getState();
    refreshState(serverState);

    Sentry.setUser({ id: serverState.env.shortId });

    if (invalidateOnSuccess) {
      // refresh queries to update the UI
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: GetEnvironmentsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: GetActiveEnvironmentQueryKey,
        }),
      ]);
    }

    onLogoutSuccess?.();
  }

  if (children !== undefined) {
    return (
      <Button
        onClick={() => void onClick()}
        renderEndIcon={() => <Icon name="logout" size="extraSmall" />}
        color="grey"
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
        sx={sx}
      />
    </Tooltip>
  );
}
