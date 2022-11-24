import mockForSlice from "../../lib/mock/Slice";
import mockForCustomType from "../../lib/mock/CustomType";
import {
  CustomTypeMockConfig,
  SliceMockConfig,
} from "../../lib/models/common/MockConfig";
import { getConfig as getGobalMockConfig } from "../../lib/mock/misc/fs";
import {
  Component,
  ComponentMocks,
  Library,
} from "@slicemachine/core/build/models/Library";
import {
  CustomPaths,
  Files,
  GeneratedCustomTypesPaths,
} from "@slicemachine/core/build/node-utils";
import { getOrElseW } from "fp-ts/lib/Either";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { CustomTypeContent } from "@prismicio/types-internal/lib/content";
import getEnv from "../../server/src/api/services/getEnv";
import * as Libraries from "@slicemachine/core/build/libraries";
import { getLocalCustomTypes } from "../../lib/utils/customTypes";

export function replaceLegacySliceMocks(
  cwd: string,
  libraries: ReadonlyArray<Library<Component>>
): void {
  try {
    const globalMockConfig = getGobalMockConfig(cwd);

    const components = libraries.reduce<Component[]>(
      (acc, curr) => [...acc, ...curr.components],
      []
    );

    components.forEach((c) => {
      const mocksPath = CustomPaths(cwd)
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
        const mocks: ComponentMocks = mockForSlice(
          c.model,
          SliceMockConfig.getSliceMockConfig(
            globalMockConfig,
            c.from,
            c.model.name
          )
        );
        Files.writeJson(mocksPath, mocks);
      }
    });
  } catch (e) {}
}

export function replaceLegacyCustomTypeMocks(
  cwd: string,
  customTypes: ReadonlyArray<CustomTypeSM>
): void {
  const globalMockConfig = getGobalMockConfig(cwd);
  customTypes.forEach((customType) => {
    const mocksPath = GeneratedCustomTypesPaths(cwd)
      .customType(customType.id)
      .mock();

    const maybeMock = Files.readEntityFromFile<CustomTypeContent>(
      mocksPath,
      (payload) => {
        return getOrElseW(() => {
          return new Error("Invalid Custom Type Content Mock");
        })(CustomTypeContent.decode(payload));
      }
    );

    if (!maybeMock || maybeMock instanceof Error) {
      const mockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
        globalMockConfig,
        customType.id
      );

      const mock = mockForCustomType(customType, mockConfig);

      if (mock) {
        Files.writeJson(mocksPath, mock);
      }
    }
  });
}

export async function updateMocks(cwd: string): Promise<void> {
  try {
    const { env } = await getEnv(cwd);

    if (env.manifest.libraries) {
      const libraries = Libraries.libraries(cwd, env.manifest.libraries);
      replaceLegacySliceMocks(cwd, libraries);
    }

    const customTypes = getLocalCustomTypes(cwd);
    replaceLegacyCustomTypeMocks(cwd, customTypes);
  } catch {}
}
