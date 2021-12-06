import mock from "@lib/mock/Slice";
import * as LibrariesState from "./LibrariesState";

import { BackendEnvironment } from "@lib/models/common/Environment";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import Files from "@lib/utils/files";
import { GeneratedPaths } from "@lib/models/paths";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { getConfig as getGobalMockConfig } from "@lib/mock/misc/fs";

export async function generate(
  env: BackendEnvironment,
  libraries: ReadonlyArray<LibraryUI>
): Promise<void> {
  try {
    const components = libraries.reduce<ComponentUI[]>(
      (acc, curr) => [...acc, ...curr.components],
      []
    );

    components.forEach(async (c) => {
      if (
        !Files.exists(
          GeneratedPaths(env.cwd)
            .library(c.from)
            .slice(c.infos.sliceName)
            .mocks()
        )
      ) {
        const mocks = await mock(
          c.infos.sliceName,
          c.model,
          SliceMockConfig.getSliceMockConfig(
            getGobalMockConfig(env.cwd),
            c.from,
            c.infos.sliceName
          )
        );
        Files.write(
          GeneratedPaths(env.cwd)
            .library(c.from)
            .slice(c.infos.sliceName)
            .mocks(),
          mocks
        );
      }
    });
  } catch (e) {}
  LibrariesState.generateState(env);
}
