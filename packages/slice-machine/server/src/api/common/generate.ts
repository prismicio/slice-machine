import mock from "@lib/mock/Slice";
import * as LibrariesState from "./LibrariesState";

import { BackendEnvironment } from "@lib/models/common/Environment";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import Files from "@lib/utils/files";
import { GeneratedPaths } from "@lib/models/paths";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { getConfig as getGobalMockConfig } from "@lib/mock/misc/fs";

export function generate(
  env: BackendEnvironment,
  libraries: ReadonlyArray<LibraryUI>
): void {
  try {
    const components = libraries.reduce<ComponentUI[]>(
      (acc, curr) => [...acc, ...curr.components],
      []
    );

    components.forEach((c) => {
      if (
        !Files.exists(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          GeneratedPaths(env.cwd)
            .library(c.from)
            .slice(c.infos.sliceName)
            .mocks()
        )
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const mocks = mock(
          c.model,
          SliceMockConfig.getSliceMockConfig(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            getGobalMockConfig(env.cwd),
            c.from,
            c.infos.sliceName
          )
        );
        Files.write(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          GeneratedPaths(env.cwd)
            .library(c.from)
            .slice(c.infos.sliceName)
            .mocks(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mocks
        );
      }
    });
  } catch (e) {}
  LibrariesState.generateState(env);
}
