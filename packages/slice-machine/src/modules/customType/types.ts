import { ArrayTabs, CustomType, ObjectTabs } from "@models/common/CustomType";
import { Field } from "@models/common/CustomType/fields";
import { CustomTypeMockConfig } from "@models/common/MockConfig";

export type PoolOfFields = ReadonlyArray<{ key: string; value: Field }>;

export type CustomTypeStoreType = {
  model: CustomType<ArrayTabs>;
  initialModel: CustomType<ArrayTabs>;
  remoteModel: CustomType<ObjectTabs> | null;
  poolOfFieldsToCheck: PoolOfFields;
  mockConfig: CustomTypeMockConfig;
  initialMockConfig: CustomTypeMockConfig;
} | null;
