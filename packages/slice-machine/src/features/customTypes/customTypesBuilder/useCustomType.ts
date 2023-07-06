import { useRequest } from "@prismicio/editor-support/Suspense";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import { managerClient } from "@src/managerClient";

export function useCustomType(id: string): CustomType | undefined {
  return useRequest(readCustomType, [id]);
}

async function readCustomType(id: string): Promise<CustomType | undefined> {
  const { errors, model } = await managerClient.customTypes.readCustomType({
    id,
  });
  if (errors.length > 0) throw errors;
  return model;
}
