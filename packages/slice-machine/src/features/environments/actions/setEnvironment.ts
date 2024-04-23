import { revalidateData } from "@prismicio/editor-support/Suspense";
import { Environment } from "@slicemachine/manager/client";

import { getState } from "@/apiClient";
import { managerClient } from "@/managerClient";

import { getActiveEnvironment } from "./getActiveEnvironment";

export async function setEnvironment(
  environment: Pick<Environment, "domain">,
): Promise<void> {
  await managerClient.project.updateEnvironment({
    environment: environment.domain,
  });

  void revalidateData(getActiveEnvironment, []);
  void revalidateData(getState, []);
}
