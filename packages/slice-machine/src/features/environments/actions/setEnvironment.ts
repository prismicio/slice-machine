import { revalidateData } from "@prismicio/editor-support/Suspense";
import { Environment } from "@slicemachine/manager/client";

import { getLegacySliceMachineState } from "@src/features/legacyState/actions/getLegacySliceMachineState";
import { managerClient } from "@src/managerClient";

import { getActiveEnvironmentDomain } from "./getActiveEnvironmentDomain";

export async function setEnvironment(
  environment: Pick<Environment, "domain">,
): Promise<void> {
  await managerClient.project.updateEnvironment({
    environment: environment.domain,
  });

  revalidateData(getActiveEnvironmentDomain, []);
  revalidateData(getLegacySliceMachineState, []);
}
