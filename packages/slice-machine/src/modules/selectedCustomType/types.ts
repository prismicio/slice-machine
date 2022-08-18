import { CustomTypeMockConfig } from "@models/common/MockConfig";
import {
  CustomTypeSM,
  TabField,
} from "@slicemachine/core/build/models/CustomType";

export enum CustomTypeStatus {
  New = "NEW_CT",
  Modified = "MODIFIED",
  Synced = "SYNCED",
  UnknownDefault = "UNKNOWN_DEFAULT",
  UnknownOffline = "UNKNOWN_OFFLINE",
  UnknownDisconnected = "UNKNOWN_DISCONNECTED",
}

export type PoolOfFields = ReadonlyArray<{ key: string; value: TabField }>;

export type SelectedCustomTypeStoreType = {
  model: CustomTypeSM;
  initialModel: CustomTypeSM;
  remoteModel: CustomTypeSM | undefined;
  mockConfig: CustomTypeMockConfig;
  initialMockConfig: CustomTypeMockConfig;
} | null;
