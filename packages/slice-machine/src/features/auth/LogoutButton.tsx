import { Button, Icon, IconButton, Tooltip } from "@prismicio/editor-ui";
import { SX } from "@prismicio/editor-ui/dist/theme";
import * as Sentry from "@sentry/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { clearAuth, getState } from "@/apiClient";
import { GetActiveEnvironmentQueryKey } from "@/features/environments/useActiveEnvironment";
import { GetEnvironmentsQueryKey } from "@/features/environments/useEnvironments";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

export function EnvironmentLogoutButton() {
  const { refreshState } = useSliceMachineActions();
  const queryClient = useQueryClient();

  async function onClick() {
    await clearAuth();

    const serverState = await getState();
    refreshState(serverState);
    Sentry.setUser({ id: serverState.env.shortId });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: GetEnvironmentsQueryKey }),
      queryClient.invalidateQueries({
        queryKey: GetActiveEnvironmentQueryKey,
      }),
    ]);

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

interface ReloadLogoutButtonProps {
  sx?: SX;
}

export function ReloadLogoutButton(props: ReloadLogoutButtonProps) {
  const { sx } = props;
  const router = useRouter();

  async function onClick() {
    await clearAuth();
    Sentry.setUser({ id: undefined });
    router.reload();
  }

  return (
    <Button
      onClick={() => void onClick()}
      renderEndIcon={() => <Icon name="logout" size="extraSmall" />}
      color="grey"
      sx={sx}
    >
      Logout
    </Button>
  );
}
