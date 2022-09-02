import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { CustomTypeStatus } from "../selectedCustomType/types";

export const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean
): CustomTypeSM => ({
  id,
  label,
  repeatable,
  tabs: [
    {
      key: "Main",
      value: [],
    },
  ],
  status: true,
  __status: CustomTypeStatus.New,
});
