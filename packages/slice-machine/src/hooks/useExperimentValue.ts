import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@src/managerClient";

async function getExperimentValue(variantName: string) {
  try {
    return await managerClient.telemetry.getExperimentValue(variantName);
  } catch (e) {
    console.error("Error while trying to get experiment value", e);
    return undefined;
  }
}

export function useExperimentValue(variantName: string): string | undefined {
  return useRequest(getExperimentValue, [variantName]);
}
