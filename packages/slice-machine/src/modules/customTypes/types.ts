import { CustomType, ObjectTabs } from "@models/common/CustomType";

export type CustomTypesStoreType = {
  localCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
  remoteCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
};
