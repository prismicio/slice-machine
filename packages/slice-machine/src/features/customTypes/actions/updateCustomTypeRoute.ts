import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { toast } from "react-toastify";

import { managerClient } from "@/managerClient";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type UpdateCustomTypeRouteArgs = {
  model: CustomType;
  newRoute: string;
  onSuccess: (updatedCustomType: CustomType) => void;
};
export async function updateCustomTypeRoute({
  model,
  newRoute,
  onSuccess,
}: UpdateCustomTypeRouteArgs) {
  const customTypesMessages =
    CUSTOM_TYPES_MESSAGES[model.format as CustomTypeFormat];

  try {
    const updatedCustomType = {
      ...model,
      route: newRoute,
    };

    const { errors } = await managerClient.customTypes.updateCustomTypeRoute({
      model: updatedCustomType,
    });

    if (errors.length > 0) {
      throw errors;
    }

    onSuccess(updatedCustomType);

    toast.success(
      `${customTypesMessages.name({
        start: true,
        plural: false,
      })} route updated`,
    );

    //
  } catch (e) {
    const errorMessage = `Internal Error: ${customTypesMessages.name({
      start: true,
      plural: false,
    })} could not be updated`;

    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
