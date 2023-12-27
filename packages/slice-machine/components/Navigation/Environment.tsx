import {
  Environment as EnvironmentType,
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";

import { telemetry } from "@src/apiClient";
import { useEnvironments } from "@src/features/environments/useEnvironments";
import { setEnvironment } from "@src/features/environments/actions/setEnvironment";
import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";
import { getLegacySliceMachineState } from "@src/features/legacyState/actions/getLegacySliceMachineState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SideNavEnvironmentSelector } from "@src/components/SideNav";
import { useNetwork } from "@src/hooks/useNetwork";

export function Environment() {
  const { environments, error: useEnvironmentsError } = useEnvironments();
  const { activeEnvironment } = useActiveEnvironment();
  const { refreshState, openLoginModal } = useSliceMachineActions();
  const isOnline = useNetwork();

  async function onSelect(environment: EnvironmentType) {
    void telemetry.track({
      event: "environment:switch",
      domain: environment.domain,
    });

    await setEnvironment(environment);

    const legacySliceMachineState = await getLegacySliceMachineState();

    refreshState(legacySliceMachineState);
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
