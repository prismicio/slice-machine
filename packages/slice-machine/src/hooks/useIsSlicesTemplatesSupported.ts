import { managerClient } from "@src/managerClient";

import { useRequest } from "@prismicio/editor-support/Suspense";
import semver from "semver";
import { useAdapterName } from "./useAdapterName";

async function getRunningAdapterVersion() {
  try {
    return await managerClient.versions.getRunningAdapterVersion();
  } catch (e) {
    console.error("Error while trying to get running adapter version", e);
    return undefined;
  }
}

export function useIsSlicesTemplatesSupported(): boolean {
  const adapterVersion = useRequest(getRunningAdapterVersion, []);
  const adapterName = useAdapterName();

  return (
    adapterName === "@slicemachine/adapter-next" &&
    adapterVersion !== undefined &&
    semver.gte(adapterVersion, "0.3.14")
  );
}
