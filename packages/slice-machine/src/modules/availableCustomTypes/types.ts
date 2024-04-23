import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";
import { LocalOrRemoteCustomType } from "@/legacy/lib/models/common/ModelData";

export type AvailableCustomTypesStoreType = Readonly<
  Record<CustomTypeSM["id"], LocalOrRemoteCustomType>
>;
