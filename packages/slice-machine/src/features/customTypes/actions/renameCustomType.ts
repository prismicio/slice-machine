import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { managerClient } from "@src/managerClient";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { CustomTypeFormat } from "@slicemachine/manager";
import { toast } from "react-toastify";

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

    await managerClient.customTypes.renameCustomType({
      model: renamedCustomType,
    });

    onSuccess(renamedCustomType);

    toast.success(
      `${customTypesMessages.name({
        start: true,
        plural: false,
      })} renamed`
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
