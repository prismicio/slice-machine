import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { CustomTypeStatus } from "../../../../src/modules/selectedCustomType/types";
import equal from "fast-deep-equal";

export const getCustomTypeStatus = (
  localCustomType: CustomTypeSM,
  remoteCustomType?: CustomTypeSM
): CustomTypeStatus => {
  if (!localCustomType || !remoteCustomType) return CustomTypeStatus.New;

  if (!equal(localCustomType, remoteCustomType)) {
    return CustomTypeStatus.Modified;
  }

  return CustomTypeStatus.Synced;
};
