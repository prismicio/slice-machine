import { CustomTypeSM } from "@slicemachine/core/models/CustomType";

export type FrontEndCustomType = {
  local: CustomTypeSM;
  remote?: CustomTypeSM;
};

export type AvailableCustomTypesStoreType = Record<string, FrontEndCustomType>;
