import { Environment as EnvironmentType } from "@slicemachine/manager/client";

import { telemetry } from "@src/apiClient";

import { useEnvironments } from "@src/features/environments/useEnvironments";
import { setEnvironment } from "@src/features/environments/actions/setEnvironment";
import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";
import { getLegacySliceMachineState } from "@src/features/legacyState/actions/getLegacySliceMachineState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import { SideNavEnvironmentSelector } from "@src/components/SideNav";

export function Environment() {
  const { environments, error: useEnvironmentsError } = useEnvironments();
  const { activeEnvironment } = useActiveEnvironment();
  const { refreshState, openLoginModal } = useSliceMachineActions();

  async function onSelect(environment: EnvironmentType) {
    void telemetry.track({
      event: "environment:switch",
      domain: environment.domain,
    });

    await setEnvironment(environment);

    const legacySliceMachineState = await getLegacySliceMachineState();

    refreshState(legacySliceMachineState);
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
    typeof useEnvironmentsError === "object" &&
    useEnvironmentsError !== null &&
    "name" in useEnvironmentsError &&
    (useEnvironmentsError.name === "UnauthenticatedError" ||
      useEnvironmentsError.name === "UnauthorizedError")
  ) {
    return (
      <SideNavEnvironmentSelector
        variant="unauthorized"
        onLogInClick={() => openLoginModal()}
      />
    );
  }

  throw useEnvironmentsError;
}
