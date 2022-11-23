import mockForSlice from "../../../../lib/mock/Slice";
import mockForCustomType from "../../../../lib/mock/CustomType";
import { LibraryUI } from "../../../../lib/models/common/LibraryUI";
import { ComponentUI } from "../../../../lib/models/common/ComponentUI";
import {
  CustomTypeMockConfig,
  SliceMockConfig,
} from "../../../../lib/models/common/MockConfig";
import { getConfig as getGobalMockConfig } from "../../../../lib/mock/misc/fs";
import { ComponentMocks } from "@slicemachine/core/build/models/Library";
import {
  CustomPaths,
  Files,
  GeneratedCustomTypesPaths,
} from "@slicemachine/core/build/node-utils";
import { getOrElseW } from "fp-ts/lib/Either";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { CustomTypeContent } from "@prismicio/types-internal/lib/content";

export function replaceLegacySliceMocks(
  cwd: string,
  libraries: ReadonlyArray<LibraryUI>
): void {
  try {
    const components = libraries.reduce<ComponentUI[]>(
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
            // here
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            getGobalMockConfig(cwd),
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

export function generate(
  cwd: string,
  libraries: ReadonlyArray<LibraryUI>,
  customTypes: ReadonlyArray<CustomTypeSM>
): void {
  replaceLegacySliceMocks(cwd, libraries);
  replaceLegacyCustomTypeMocks(cwd, customTypes);
}
