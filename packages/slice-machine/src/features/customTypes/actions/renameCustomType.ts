import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { toast } from "react-toastify";

import { managerClient } from "@/managerClient";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type RenameCustomTypeArgs = {
  model: CustomType;
  newLabel: string;
  onSuccess: (renamedCustomType: CustomType) => void;
};
export async function renameCustomType({
  model,
  newLabel,
  onSuccess,
}: RenameCustomTypeArgs) {
  const customTypesMessages =
    CUSTOM_TYPES_MESSAGES[model.format as CustomTypeFormat];

  try {
    const renamedCustomType = {
      ...model,
      label: newLabel,
    };

    const { errors } = await managerClient.customTypes.renameCustomType({
      model: renamedCustomType,
    });

    if (errors.length > 0) {
      throw errors;
    }

    onSuccess(renamedCustomType);

    toast.success(
      `${customTypesMessages.name({
        start: true,
        plural: false,
      })} renamed`,
    );
  } catch (e) {
    const errorMessage = `Internal Error: ${customTypesMessages.name({
      start: true,
      plural: false,
    })} could not be renamed`;

    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
