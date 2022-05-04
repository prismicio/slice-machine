import { CustomTypeMockConfig } from "@models/common/MockConfig";
import {
  CustomTypeSM,
  TabField,
} from "@slicemachine/core/build/models/CustomType";

export enum CustomTypeStatus {
  New = "NEW_CT",
  Modified = "MODIFIED",
  Synced = "SYNCED",
}

export type PoolOfFields = ReadonlyArray<{ key: string; value: TabField }>;

export type SelectedCustomTypeStoreType = {
  model: CustomTypeSM;
  remoteModel: CustomTypeSM | undefined;
  mockConfig: CustomTypeMockConfig;
  initialMockConfig: CustomTypeMockConfig;
} | null;
