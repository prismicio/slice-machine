import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { managerClient } from "@src/managerClient";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { CustomTypeFormat } from "@slicemachine/manager/*";
import { toast } from "react-toastify";

export async function deleteCustomType(
  customType: CustomType,
  onSuccess: () => void
) {
  const customTypesMessages =
    CUSTOM_TYPES_MESSAGES[customType.format as CustomTypeFormat];

  try {
    await managerClient.customTypes.deleteCustomType({ id: customType.id });

    onSuccess();

    toast.success(
      `${customTypesMessages.name({
        start: true,
        plural: false,
      })} deleted`
    );
  } catch (e) {
    toast.error(
      `Internal Error: ${customTypesMessages.name({
        start: true,
        plural: false,
      })} could not be deleted`
    );
  }
}
