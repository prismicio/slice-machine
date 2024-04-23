import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

export async function getIsEmptyProject() {
  const [
    { errors: customTypesErrors, models: customTypes },
    { errors: slicesErrors, models: slices },
  ] = await Promise.all([
    managerClient.customTypes.readAllCustomTypes(undefined),
    managerClient.slices.readAllSlices(),
  ]);

  if (customTypesErrors.length > 0 || slicesErrors.length > 0) {
    throw [...customTypesErrors, ...slicesErrors];
  }

  return customTypes?.length === 0 && slices?.length === 0;
}

export function useIsEmptyProject() {
  const isEmptyProject = useRequest(getIsEmptyProject, []);
  return isEmptyProject;
}
