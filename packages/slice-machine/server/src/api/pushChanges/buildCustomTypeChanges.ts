import {
  type CustomTypeInsertChange,
  type CustomTypeUpdateChange,
  type CustomTypeDeleteChange,
  ChangeTypes,
} from "@slicemachine/client";
import {
  CustomTypes,
  type CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";
import {
  ModelStatus,
  computeModelStatus,
} from "../../../../lib/models/common/ModelStatus";
import { LocalOrRemoteCustomType } from "../../../../lib/models/common/ModelData";
import { normalizeFrontendCustomTypes } from "../../../../lib/models/common/normalizers/customType";

export function buildCustomTypeChanges(
  localCustomTypes: CustomTypeSM[],
  remoteCustomTypes: CustomTypeSM[]
): (
  | CustomTypeInsertChange
  | CustomTypeUpdateChange
  | CustomTypeDeleteChange
)[] {
  const customTypeModels: ReadonlyArray<LocalOrRemoteCustomType> =
    Object.values(
      normalizeFrontendCustomTypes(localCustomTypes, remoteCustomTypes)
    );

  return customTypeModels.reduce<
    (CustomTypeInsertChange | CustomTypeUpdateChange | CustomTypeDeleteChange)[]
  >((acc, customType) => {
    // assessing the user is connected if we went that far in the processing
    const statusResult = computeModelStatus(customType, true);

    switch (statusResult.status) {
      case ModelStatus.New: {
        const payload = CustomTypes.fromSM(statusResult.model.local);
        const customTypeInsert: CustomTypeInsertChange = {
          type: ChangeTypes.CUSTOM_TYPE_INSERT,
          id: payload.id,
          payload,
        };
        return [...acc, customTypeInsert];
      }

      case ModelStatus.Modified: {
        const payload = CustomTypes.fromSM(statusResult.model.local);
        const customTypeUpdate: CustomTypeUpdateChange = {
          type: ChangeTypes.CUSTOM_TYPE_UPDATE,
          id: payload.id,
          payload,
        };
        return [...acc, customTypeUpdate];
      }

      case ModelStatus.Deleted: {
        const payload = CustomTypes.fromSM(statusResult.model.remote);
        const customTypeDelete: CustomTypeDeleteChange = {
          type: ChangeTypes.CUSTOM_TYPE_DELETE,
          id: payload.id,
          payload: { id: payload.id },
        };
        return [...acc, customTypeDelete];
      }

      default: {
        return acc;
      }
    }
  }, []);
}
