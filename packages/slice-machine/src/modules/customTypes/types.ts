import { CustomType, ObjectTabs } from "@models/common/CustomType";

export type CustomTypesStoreType = {
  localCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
};
