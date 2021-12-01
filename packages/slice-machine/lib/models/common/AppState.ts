import type { Models } from "@slicemachine/models";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import Environment from "@lib/models/common/Environment";
import { LibraryUI } from "../common/LibraryUI";

interface AppState {
  env: Environment;
  libraries?: ReadonlyArray<LibraryUI>;
  customTypes?: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes?: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteSlices?: ReadonlyArray<Models.SliceAsObject>;
}

const AppState = {
  filter<T extends AppState>({
    env,
    libraries,
    customTypes,
    remoteCustomTypes,
    remoteSlices,
  }: T): AppState {
    return {
      env,
      libraries,
      customTypes,
      remoteCustomTypes,
      remoteSlices,
    };
  },
};

export default AppState;
