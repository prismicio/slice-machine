import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { managerClient } from "@src/managerClient";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { CustomTypeFormat } from "@slicemachine/manager/*";
import { toast } from "react-toastify";

type DeleteCustomTypeArgs = {
  customType: CustomType;
  onSuccess: () => void;
};

export async function deleteCustomType({
  customType,
  onSuccess,
}: DeleteCustomTypeArgs) {
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
    const errorMessage = `Internal Error: ${customTypesMessages.name({
      start: true,
      plural: false,
    })} could not be deleted`;
    console.error(errorMessage, e);
  }
}
