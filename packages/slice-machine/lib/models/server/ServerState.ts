import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import ServerError from "./ServerError";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import { Models } from "@slicemachine/core";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}

export default interface ServerState {
  env: FrontEndEnvironment;
  libraries: ReadonlyArray<LibraryUI> | null;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError: ErrorWithStatus | undefined;
  configErrors: ConfigErrors;
  warnings: ReadonlyArray<Warning>;
}
