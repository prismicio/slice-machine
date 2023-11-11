import {
  Environment as EnvironmentType,
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";

import { useEnvironments } from "@src/features/environments/useEnvironments";
import { setEnvironment } from "@src/features/environments/actions/setEnvironment";
import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import { SideNavEnvironmentSelector } from "@src/components/SideNav";

export function Environment() {
  const { environments, error: useEnvironmentsError } = useEnvironments();
  const { activeEnvironment } = useActiveEnvironment();
  const { openLoginModal } = useSliceMachineActions();

  async function onSelect(environment: EnvironmentType) {
    await setEnvironment(environment);
  }

  if (
    isUnauthenticatedError(useEnvironmentsError) ||
    isUnauthorizedError(useEnvironmentsError)
  ) {
    return (
      <SideNavEnvironmentSelector
        variant="unauthorized"
        onLogInClick={() => openLoginModal()}
      />
    );
  }

  return (
    <SideNavEnvironmentSelector
      environments={environments}
      activeEnvironment={activeEnvironment}
      onSelect={onSelect}
    />
  );
}
