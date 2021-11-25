import { FrontEndEnvironment } from "@lib/models/common/Environment";
import Slice from "@lib/models/common/Slice";
import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import { Library } from "@lib/models/common/Library";
import { AsObject } from "@lib/models/common/Variation";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";

import ServerError from "./ServerError";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}

export interface ServerState {
  libraries: ReadonlyArray<Library>;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteSlices: ReadonlyArray<Slice<AsObject>>;
  clientError: ErrorWithStatus | undefined;
  configErrors: ConfigErrors | undefined;
  env: FrontEndEnvironment;
  warnings: ReadonlyArray<Warning>;
  isFake: boolean;
}

export interface AppPayload {
  env: FrontEndEnvironment;
  libraries?: ReadonlyArray<Library>;
  customTypes?: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes?: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteSlices?: ReadonlyArray<Slice<AsObject>>;
}
