import {
  Environment as EnvironmentType,
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
import { useState } from "react";

import { getState, telemetry } from "@/apiClient";
import { setEnvironment } from "@/features/environments/actions/setEnvironment";
import { useActiveEnvironment } from "@/features/environments/useActiveEnvironment";
import { useEnvironments } from "@/features/environments/useEnvironments";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { getUnSyncedChanges } from "@/features/sync/getUnSyncChanges";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNetwork } from "@/hooks/useNetwork";
import { normalizeFrontendCustomTypes } from "@/legacy/lib/models/common/normalizers/customType";
import { normalizeFrontendSlices } from "@/legacy/lib/models/common/normalizers/slices";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { SideNavEnvironmentSelector } from "./SideNavEnvironmentSelector/SideNavEnvironmentSelector";

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
