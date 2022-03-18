import { ArrayTabs, CustomType } from "@models/common/CustomType";
import { Field } from "@models/common/CustomType/fields";
import { CustomTypeMockConfig } from "@models/common/MockConfig";

export type PoolOfFields = ReadonlyArray<{ key: string; value: Field }>;

export type SelectedCustomTypeStoreType = {
  model: CustomType<ArrayTabs>;
  initialModel: CustomType<ArrayTabs>;
  remoteModel: CustomType<ArrayTabs> | null;
  mockConfig: CustomTypeMockConfig;
  initialMockConfig: CustomTypeMockConfig;
} | null;
