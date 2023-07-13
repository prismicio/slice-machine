import { toast } from "react-toastify";

import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { managerClient } from "@src/managerClient";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

export async function convertCustomToPageType(
  customType: CustomType,
  saveCustomType: (customType: CustomType) => void
) {
  const customTypesMessages =
    CUSTOM_TYPES_MESSAGES[customType.format as CustomTypeFormat];

  try {
    const newCustomType: CustomType = {
      ...customType,
      format: "page",
    };
    await managerClient.customTypes.updateCustomType({
      model: newCustomType,
    });

    // Update the custom type in the redux store
    saveCustomType(newCustomType);

    toast.success(
      `${customTypesMessages.name({
        start: true,
        plural: false,
      })} converted to page type`
    );
  } catch (e) {
    toast.error(
      `Internal Error: ${customTypesMessages.name({
        start: true,
        plural: false,
      })} not converted to page type`
    );
  }
}
