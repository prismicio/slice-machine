import { CustomType, ObjectTabs } from "@models/common/CustomType";

export type FrontEndCustomType = {
  local: CustomType<ObjectTabs>;
  remote?: CustomType<ObjectTabs>;
};

export type CustomTypesStoreType = {
  map: Record<string, FrontEndCustomType>;
};
