import ServerError from "./ServerError";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { SliceSM } from "@slicemachine/core/build/src/models";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}

export default interface ServerState {
  env: FrontEndEnvironment;
  libraries: ReadonlyArray<LibraryUI>;
  customTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
  remoteSlices: ReadonlyArray<SliceSM>;
}
