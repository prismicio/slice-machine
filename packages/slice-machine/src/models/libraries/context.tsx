import React from "react";
import { useModelReducer } from "../slice/context";

import Environment from "../../../lib/models/common/Environment";
import { Library } from "../../../lib/models/common/Library";
import Slice from "../../../lib/models/common/Slice";
import { AsObject } from "../../../lib/models/common/Variation";

import LibraryState from "../../../lib/models/ui/LibraryState";

import { SliceMockConfig } from "../../../lib/models/common/MockConfig";

export const LibrariesContext = React.createContext<
  Partial<ReadonlyArray<LibraryState>>
>([]);

type LibraryHandlerProps = {
  libraries: ReadonlyArray<Library>;
  env: Environment;
  remoteSlices?: ReadonlyArray<Slice<AsObject>>;
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
