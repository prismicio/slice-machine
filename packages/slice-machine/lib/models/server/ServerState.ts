import { FrontEndEnvironment } from "../common/Environment";
import { LibraryUI } from "../common/LibraryUI";
import { SliceSM } from "@lib/models/common/Slice";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import ErrorWithStatus from "../common/ErrorWithStatus";

export default interface ServerState {
  env: FrontEndEnvironment;
  libraries: ReadonlyArray<LibraryUI>;
  customTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
  remoteSlices: ReadonlyArray<SliceSM>;
  clientError?: ErrorWithStatus;
}
