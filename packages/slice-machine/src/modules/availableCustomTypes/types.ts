import { CustomType, ObjectTabs } from "@models/common/CustomType";

export type FrontEndCustomType = {
  local: CustomType<ObjectTabs>;
  remote?: CustomType<ObjectTabs>;
};

export type AvailableCustomTypesStoreType = {
  map: Record<string, FrontEndCustomType>;
};
