import {
  revalidateData,
  updateData,
  useRequest,
} from "@prismicio/editor-support/Suspense";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";
import type { CustomTypeFormat } from "@slicemachine/manager";
import { useCallback } from "react";

import { managerClient } from "@/managerClient";

type UseCustomTypesReturnType = {
  customTypes: CustomType[];
  updateCustomTypes: (customTypes: CustomType[]) => void;
};

export function useCustomTypes(
  format?: CustomTypeFormat,
): UseCustomTypesReturnType {
  const updateCustomTypes = useCallback(
    (data: CustomType[]) => updateData(getCustomTypes, [format], data),
    [format],
  );

  return {
    customTypes: useRequest(getCustomTypes, [format]),
    updateCustomTypes,
  };
}

export async function getCustomTypes(
  format?: CustomTypeFormat,
): Promise<CustomType[]> {
  const { errors, models } = await managerClient.customTypes.readAllCustomTypes(
    format ? { format } : undefined,
  );

  if (errors.length > 0) {
    throw errors;
  }

  return models.map(({ model }) => model);
}

export function revalidateGetCustomTypes(format?: CustomTypeFormat) {
  void revalidateData(getCustomTypes, []);
  void revalidateData(getCustomTypes, [format]);
}
