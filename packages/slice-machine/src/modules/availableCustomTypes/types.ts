import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

export type FrontEndCustomType = {
  local: CustomTypeSM;
  remote?: CustomTypeSM;
};

export type AvailableCustomTypesStoreType = Readonly<
  Record<string, FrontEndCustomType>
>;
