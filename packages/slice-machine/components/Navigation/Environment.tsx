import { useState } from "react";
import {
  Environment as EnvironmentType,
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";

import { getState, telemetry } from "@src/apiClient";
import { useEnvironments } from "@src/features/environments/useEnvironments";
import { setEnvironment } from "@src/features/environments/actions/setEnvironment";
import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SideNavEnvironmentSelector } from "@src/components/SideNav";
import { useNetwork } from "@src/hooks/useNetwork";
import { useAutoSync } from "@src/features/sync/AutoSyncProvider";
import { normalizeFrontendSlices } from "@lib/models/common/normalizers/slices";
import { normalizeFrontendCustomTypes } from "@lib/models/common/normalizers/customType";
import { getUnSyncedChanges } from "@src/features/sync/getUnSyncChanges";
import { useAuthStatus } from "@src/hooks/useAuthStatus";

export function Environment() {
  const { environments, error: useEnvironmentsError } = useEnvironments();
  const { activeEnvironment } = useActiveEnvironment();
  const { refreshState, openLoginModal } = useSliceMachineActions();
  const { syncChanges } = useAutoSync();
  const isOnline = useNetwork();
  const authStatus = useAuthStatus();
  const [isSwitchingEnv, setIsSwitchingEnv] = useState(false);
  const { autoSyncStatus } = useAutoSync();

  async function onSelect(environment: EnvironmentType) {
    if (activeEnvironment?.name === environment.name) {
      return;
    }

    setIsSwitchingEnv(true);

    void telemetry.track({
      event: "environment:switch",
      domain: environment.domain,
    });

    await setEnvironment(environment);

    const serverState = await getState();
    refreshState(serverState);

    const slices = normalizeFrontendSlices(
      serverState.libraries,
      serverState.remoteSlices,
    );
    const customTypes = Object.values(
      normalizeFrontendCustomTypes(
        serverState.customTypes,
        serverState.remoteCustomTypes,
      ),
    );
    const { changedCustomTypes, changedSlices } = getUnSyncedChanges({
      authStatus,
      customTypes,
      isOnline,
      libraries: serverState.libraries,
      slices,
    });

    if (
      environment.kind === "dev" &&
      (changedCustomTypes.length > 0 || changedSlices.length > 0)
    ) {
      syncChanges({
        environment,
        changedCustomTypes,
        changedSlices,
      });
    }

    setIsSwitchingEnv(false);
  }

  if (!isOnline) {
    return <SideNavEnvironmentSelector variant="offline" />;
  }

  if (useEnvironmentsError === undefined) {
    return (
      <SideNavEnvironmentSelector
        environments={environments}
        activeEnvironment={activeEnvironment}
        onSelect={onSelect}
        disabled={isSwitchingEnv || autoSyncStatus === "syncing"}
        loading={isSwitchingEnv}
      />
    );
  }

  if (
    isUnauthenticatedError(useEnvironmentsError) ||
    isUnauthorizedError(useEnvironmentsError)
  ) {
    return (
      <SideNavEnvironmentSelector
        variant={
          isUnauthenticatedError(useEnvironmentsError)
            ? "unauthenticated"
            : "unauthorized"
        }
        onLogInClick={() => openLoginModal()}
      />
    );
  }

  throw useEnvironmentsError;
}
