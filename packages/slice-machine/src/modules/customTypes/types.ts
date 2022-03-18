import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

export type CustomTypesStoreType = {
  localCustomTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
};
