import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

import { updateData, useRequest } from "@prismicio/editor-support/Suspense";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";
import type { CustomTypeFormat } from "@slicemachine/manager";
import { managerClient } from "@src/managerClient";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import type { SliceMachineStoreType } from "@src/redux/type";
import { hasLocal } from "@lib/models/common/ModelData";
import { CustomTypes } from "@lib/models/common/CustomType";

type UseCustomTypesReturnType = {
  customTypes: CustomType[];
  updateCustomTypes: (customTypes: CustomType[]) => void;
};

export function useCustomTypes(
  format: CustomTypeFormat
): UseCustomTypesReturnType {
  const updateCustomTypes = useCallback(
    (data: CustomType[]) => updateData(getCustomTypes, [format], data),
    [format]
  );

  return {
    customTypes: useRequest(getCustomTypes, [format]),
    updateCustomTypes,
  };
}

async function getCustomTypes(format: CustomTypeFormat): Promise<CustomType[]> {
  const { errors, models } = await managerClient.customTypes.readAllCustomTypes(
    { format }
  );

  if (errors.length > 0) {
    throw errors;
  }

  return models.map(({ model }) => model);
}

/**
 * TODO: DT-1363 - Update the way to have new data without Redux by revalidating
 * Suspense
 */
export function useCustomTypesAutoRevalidation(
  customTypes: CustomType[],
  format: CustomTypeFormat,
  updateCustomTypes: (data: CustomType[]) => void
): void {
  const { storeCustomTypes } = useSelector((store: SliceMachineStoreType) => ({
    storeCustomTypes: selectAllCustomTypes(store).filter(hasLocal),
  }));

  useEffect(() => {
    const storeCustomTypesFiltered = storeCustomTypes.filter(
      ({ local }) => local.format === format
    );

    if (
      storeCustomTypesFiltered.length !== customTypes.length ||
      storeCustomTypesFiltered.some((ct) => {
        // We compare the stringified version of the custom type from the store and
        // the one from suspense because it could not be the same after some
        // modifications (rename, add/remove field, new tab, etc.)
        const currentCustomType = customTypes.find(
          (ct2: CustomType) => ct2.id === ct.local.id
        );

        return (
          !currentCustomType ||
          JSON.stringify(CustomTypes.fromSM(ct.local)) !==
            JSON.stringify(currentCustomType)
        );
      })
    ) {
      const newCustomTypes: CustomType[] = storeCustomTypesFiltered.map(
        ({ local }) => CustomTypes.fromSM(local)
      );

      updateCustomTypes(newCustomTypes);
    }
  }, [format, updateCustomTypes, customTypes, storeCustomTypes]);
}
