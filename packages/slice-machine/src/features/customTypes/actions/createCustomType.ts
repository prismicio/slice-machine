import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { toast } from "react-toastify";

import { telemetry, updateCustomType } from "@/apiClient";
import { create } from "@/domain/customType";
import { ToastMessageWithPath } from "@/legacy/components/ToasterContainer";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type DeleteCustomTypeArgs = {
  format: CustomTypeFormat;
  id: string;
  label: string;
  origin: CustomTypeOrigin;
  repeatable: boolean;
  onSuccess: (newCustomType: CustomType) => Promise<void>;
};

export type CustomTypeOrigin = "onboarding" | "table";

export async function createCustomType(args: DeleteCustomTypeArgs) {
  const { id, label, repeatable, format, onSuccess } = args;
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  const newCustomType: CustomType = create({
    id,
    label,
    repeatable,
    format,
  });

  try {
    const { errors } = await updateCustomType(newCustomType);

    if (errors.length > 0) {
      throw errors;
    }

    void telemetry.track({
      event: "custom-type:created",
      id: newCustomType.id,
      name: label,
      format: format,
      type: repeatable ? "repeatable" : "single",
      origin: "table",
    });

    await onSuccess(newCustomType);

    toast.success(
      ToastMessageWithPath({
        message: `${customTypesMessages.name({
          start: true,
          plural: false,
        })} saved successfully at `,
        path: `./customtypes/${newCustomType.id}/index.json`,
      }),
    );
  } catch (e) {
    const errorMessage = `Internal Error: ${customTypesMessages.name({
      start: true,
      plural: false,
    })} not saved`;

    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
