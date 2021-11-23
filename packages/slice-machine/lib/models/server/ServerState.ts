import type { Models } from "@slicemachine/core";
import Environment from "@lib/models/common/Environment";
import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";

import ServerError from "./ServerError";
import { LibraryUI } from "../common/LibraryUI";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}
export interface ServerState {
  libraries: ReadonlyArray<LibraryUI>;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError?: ErrorWithStatus;
  configErrors: ConfigErrors;
  env: Environment;
  warnings: ReadonlyArray<Warning>;
}
