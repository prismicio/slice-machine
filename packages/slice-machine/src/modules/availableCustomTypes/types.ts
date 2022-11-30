import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

export type LocalFrontEndCustomType = {
  local: CustomTypeSM;
  remote?: CustomTypeSM;
};

export type DeletedFrontEndCustomType = {
  local: undefined;
  remote: CustomTypeSM;
};

// TODO whats the difference between this and packages/slice-machine/lib/models/common/ModelStatus/compareCustomTypeModels.ts::FrontEndCtModel
export type FrontEndCustomType =
  | LocalFrontEndCustomType
  | DeletedFrontEndCustomType;

export const isLocalCustomType = (
  ct: FrontEndCustomType
): ct is LocalFrontEndCustomType => ct.local !== undefined;

export const isDeletedCustomType = (
  ct: FrontEndCustomType
): ct is DeletedFrontEndCustomType => !isLocalCustomType(ct);

export const getCustomTypeProp = <key extends keyof CustomTypeSM>(
  ct: FrontEndCustomType,
  property: key
): CustomTypeSM[key] =>
  isLocalCustomType(ct) ? ct.local[property] : ct.remote[property];

export type AvailableCustomTypesStoreType = Readonly<
  Record<string, FrontEndCustomType>
>;
