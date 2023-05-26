import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

import { managerClient } from "@src/managerClient";
import { updateData, useRequest } from "./Suspense";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";
import type { CustomTypeFormat } from "@slicemachine/manager";
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
  console.log("!!!! NEW FETCH !!!!", format);
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

  console.log({ models });

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
  console.log({ storeCustomTypes });

  useEffect(() => {
    const storeCustomTypesFiltered = storeCustomTypes.filter(
      ({ local }) => local.format === format
    );

    if (
      storeCustomTypesFiltered.length !== customTypes.length ||
      storeCustomTypesFiltered.some(
        (ct) =>
          ct.local.label !==
          customTypes.find((ct2: CustomType) => ct2.id === ct.local.id)?.label
      )
    ) {
      const newCustomTypes: CustomType[] = storeCustomTypesFiltered.map(
        ({ local }) => CustomTypes.fromSM(local)
      );

      console.log({ format, newCustomTypes, storeCustomTypesFiltered });

      updateCustomTypes(newCustomTypes);
    }
  }, [format, updateCustomTypes, customTypes, storeCustomTypes]);
}
