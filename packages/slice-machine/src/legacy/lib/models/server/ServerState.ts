import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";
import { SliceSM } from "@/legacy/lib/models/common/Slice";

import { FrontEndEnvironment } from "../common/Environment";
import ErrorWithStatus from "../common/ErrorWithStatus";
import { LibraryUI } from "../common/LibraryUI";

export default interface ServerState {
  env: FrontEndEnvironment;
  libraries: ReadonlyArray<LibraryUI>;
  customTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
  remoteSlices: ReadonlyArray<SliceSM>;
  clientError?: ErrorWithStatus;
}
