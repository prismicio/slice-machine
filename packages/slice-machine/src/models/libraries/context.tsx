import React from "react";
import { useModelReducer } from "../slice/context";

import { FrontEndEnvironment } from "lib/models/common/Environment";
import LibraryState from "../../../lib/models/ui/LibraryState";
import { LibraryUI } from "lib/models/common/LibraryUI";

import { SliceMockConfig } from "lib/models/common/MockConfig";
import { SliceSM } from "@slicemachine/core/build/models";

export const LibrariesContext =
  React.createContext<ReadonlyArray<LibraryState> | null>(null);

type LibraryHandlerProps = {
  libraries: ReadonlyArray<LibraryUI> | null;
  env: FrontEndEnvironment;
  remoteSlices: ReadonlyArray<SliceSM>;
};

const LibraryHandler: React.FunctionComponent<LibraryHandlerProps> = ({
  children,
  libraries,
  remoteSlices,
  env,
}) => {
  const models: ReadonlyArray<LibraryState> | null =
    libraries &&
    libraries.map((lib) => {
      return {
        name: lib.name,
        isLocal: lib.isLocal,
        // THIS CAN LEAD TO BUGS IF MORE COMPONENTS ARE ADDED OR REMOVED
        components: lib.components.map((component) =>
          useModelReducer({
            slice: component,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockConfig: SliceMockConfig.getSliceMockConfig(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
              env.mockConfig,
              lib.name,
              component.model.name
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
