import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { managerClient } from "@src/managerClient";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { CustomTypeFormat } from "@slicemachine/manager";
import { toast } from "react-toastify";

type RenameCustomTypeArgs = {
  model: CustomType;
  newName: string;
  onSuccess: (renamedCustomType: CustomType) => void;
};
export async function renameCustomType({
  model,
  newName,
  onSuccess,
}: RenameCustomTypeArgs) {
  const customTypesMessages =
    CUSTOM_TYPES_MESSAGES[model.format as CustomTypeFormat];

  try {
    const renamedCustomType = {
      ...model,
      label: newName,
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
    toast.error(
      `Internal Error: ${customTypesMessages.name({
        start: true,
        plural: false,
      })} could not be renamed`
    );
  }
}
