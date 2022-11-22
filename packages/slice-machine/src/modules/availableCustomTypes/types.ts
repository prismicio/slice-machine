import { CustomTypeSM } from "@prismic-beta/slicemachine-core/build/models/CustomType";

export type FrontEndCustomType = {
  local: CustomTypeSM;
  remote?: CustomTypeSM;
};

export type AvailableCustomTypesStoreType = Record<string, FrontEndCustomType>;
