import { CustomTypeSM } from "@lib/models/common/CustomType";
import { LocalOrRemoteCustomType } from "@lib/models/common/ModelData";

export type AvailableCustomTypesStoreType = Readonly<
  Record<CustomTypeSM["id"], LocalOrRemoteCustomType>
>;
