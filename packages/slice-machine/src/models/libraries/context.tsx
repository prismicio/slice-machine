import React from "react";
import type { Models } from "@slicemachine/core";
import { useModelReducer } from "../slice/context";

import Environment from "../../../lib/models/common/Environment";
import LibraryState from "../../../lib/models/ui/LibraryState";
import { LibraryUI } from "../../../lib/models/common/LibraryUI";

import { SliceMockConfig } from "../../../lib/models/common/MockConfig";

export const LibrariesContext = React.createContext<
  Partial<ReadonlyArray<LibraryState>>
>([]);

type LibraryHandlerProps = {
  libraries: ReadonlyArray<LibraryUI>;
  env: Environment;
  remoteSlices?: ReadonlyArray<Models.SliceAsObject>;
};

const LibraryHandler: React.FunctionComponent<LibraryHandlerProps> = ({
  children,
  libraries,
  remoteSlices,
  env,
}) => {
  const models: ReadonlyArray<LibraryState> = libraries.map((lib) => {
    return {
      name: lib.name,
      isLocal: lib.isLocal,
      components: lib.components.map((component) =>
        useModelReducer({
          slice: component,
          mockConfig: SliceMockConfig.getSliceMockConfig(
            env.mockConfig,
            lib.name,
            component.infos.sliceName
          ),
          remoteSlice: remoteSlices?.find((e) => e.id === component.model.id),
        })
      ),
    };
  });

  return (
    <LibrariesContext.Provider value={models}>
      {children}
    </LibrariesContext.Provider>
  );
};

export default LibraryHandler;
