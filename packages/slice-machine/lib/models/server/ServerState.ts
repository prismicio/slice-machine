import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import ServerError from "./ServerError";
import { FrontEndEnvironment } from "@models/common/Environment";
import { LibraryUI } from "@models/common/LibraryUI";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { Models } from "@slicemachine/core";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}

export default interface ServerState {
  env: FrontEndEnvironment;
  libraries: ReadonlyArray<LibraryUI> | undefined;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError: ErrorWithStatus | undefined;
  configErrors: ConfigErrors;
  warnings: ReadonlyArray<Warning>;
}
