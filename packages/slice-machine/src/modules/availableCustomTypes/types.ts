import { LocalOrRemoteCustomType } from "@lib/models/common/ModelData";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

export type AvailableCustomTypesStoreType = Readonly<
  Record<CustomTypeSM["id"], LocalOrRemoteCustomType>
>;
