import { revalidateData } from "@prismicio/editor-support/Suspense";
import { Environment } from "@slicemachine/manager/client";

import { managerClient } from "@src/managerClient";

import { getActiveEnvironment } from "../useActiveEnvironment";

export async function setEnvironment(
  environment: Pick<Environment, "domain">,
): Promise<void> {
  await managerClient.project.updateEnvironment({
    environment: environment.domain,
  });
  revalidateData(getActiveEnvironment, []);
}
