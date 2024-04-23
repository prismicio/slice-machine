import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { toast } from "react-toastify";

import { updateCustomType } from "@/apiClient";
import { convertToPageType } from "@/domain/customType";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

export async function convertCustomToPageType(
  customType: CustomType,
  onSuccess: (newCustomType: CustomType) => void,
) {
  const customTypesMessages =
    CUSTOM_TYPES_MESSAGES[customType.format as CustomTypeFormat];

  try {
    const newCustomType = convertToPageType(customType);
    const { errors } = await updateCustomType(newCustomType);

    if (errors.length > 0) {
      throw errors;
    }

    onSuccess(newCustomType);

    toast.success(
      `${customTypesMessages.name({
        start: true,
        plural: false,
      })} converted to page type`,
    );
  } catch (e) {
    const errorMessage = `Internal Error: ${customTypesMessages.name({
      start: true,
      plural: false,
    })} not converted to page type`;

    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
