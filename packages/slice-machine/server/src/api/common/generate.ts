import mock from "../../../../lib/mock/Slice";
import * as LibrariesState from "./LibrariesState";

import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import { LibraryUI } from "../../../../lib/models/common/LibraryUI";
import { ComponentUI } from "../../../../lib/models/common/ComponentUI";
import { GeneratedPaths } from "../../../../lib/models/paths";
import { SliceMockConfig } from "../../../../lib/models/common/MockConfig";
import { getConfig as getGobalMockConfig } from "../../../../lib/mock/misc/fs";
import { ComponentMocks } from "@slicemachine/core/build/models/Library";
import { CustomPaths, Files } from "@slicemachine/core/build/node-utils";
import { getOrElseW } from "fp-ts/lib/Either";

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
      const mocksPath = CustomPaths(env.cwd)
        .library(c.from)
        .slice(c.model.name)
        .mocks();
      const currentMocks = Files.readEntityFromFile<ComponentMocks>(
        mocksPath,
        (payload: unknown) => {
          return getOrElseW(() => new Error("Invalid component mocks."))(
            ComponentMocks.decode(payload)
          );
        }
      );

      if (!currentMocks || currentMocks instanceof Error) {
        const mocks: ComponentMocks = mock(
          c.model,
          SliceMockConfig.getSliceMockConfig(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            getGobalMockConfig(env.cwd),
            c.from,
            c.model.name
          )
        );
        Files.writeJson(
          GeneratedPaths(env.cwd).library(c.from).slice(c.model.name).mocks(),
          mocks
        );
      }
    });
  } catch (e) {}
  LibrariesState.generateState(env);
}
