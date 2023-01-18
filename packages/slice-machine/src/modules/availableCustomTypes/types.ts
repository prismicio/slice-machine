import { CustomTypeSM } from "@lib/models/common/CustomType";

export type FrontEndCustomType = {
  local: CustomTypeSM;
  remote?: CustomTypeSM;
};

export type AvailableCustomTypesStoreType = Record<string, FrontEndCustomType>;
