import mockForSlice from "../../../../lib/mock/Slice";
import mockForCustomType from "../../../../lib/mock/CustomType";
import {
  CustomTypeMockConfig,
  SliceMockConfig,
} from "../../../../lib/models/common/MockConfig";
import { getConfig as getGobalMockConfig } from "../../../../lib/mock/misc/fs";
import {
  Component,
  ComponentMocks,
  Library,
} from "@slicemachine/core/build/models/Library";
import {
  Files,
  GeneratedCustomTypesPaths,
  sliceMockPath,
} from "@slicemachine/core/build/node-utils";
import { getOrElseW } from "fp-ts/lib/Either";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { Document } from "@prismicio/types-internal/lib/content";
import * as Libraries from "@slicemachine/core/build/libraries";
import { getLocalCustomTypes } from "../../../../lib/utils/customTypes";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { Slices } from "@slicemachine/core/build/models";

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
      const mocksPath = sliceMockPath(cwd, c.from, c.model.name);

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
  customTypes: ReadonlyArray<CustomTypeSM>,
  sharedSlices: Record<string, SharedSlice>
): void {
  const globalMockConfig = getGobalMockConfig(cwd);
  customTypes.forEach((customType) => {
    const mocksPath = GeneratedCustomTypesPaths(cwd)
      .customType(customType.id)
      .mock();

    const maybeMock = Files.readEntityFromFile<Document>(
      mocksPath,
      (payload) => {
        return getOrElseW(() => {
          return new Error("Invalid Custom Type Content Mock");
        })(Document.decode(payload));
      }
    );

    if (!maybeMock || maybeMock instanceof Error) {
      const mockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
        globalMockConfig,
        customType.id
      );

      const mock = mockForCustomType(customType, mockConfig, sharedSlices);

      if (mock) {
        Files.writeJson(mocksPath, mock);
      }
    }
  });
}

export function updateMocks(
  cwd: string,
  manifestLibraries: Array<string> = []
): void {
  const str = "######## UPDATE #######";
  console.time(str);
  try {
    const libraries = Libraries.libraries(cwd, manifestLibraries);
    replaceLegacySliceMocks(cwd, libraries);

    const components = libraries.reduce<Component[]>((acc, lib) => {
      return [...acc, ...lib.components];
    }, []);

    const sharedSlices = components.reduce<Record<string, SharedSlice>>(
      (acc, component) => {
        const slice = Slices.fromSM(component.model);
        return {
          ...acc,
          [slice.id]: slice,
        };
      },
      {}
    );

    const customTypes = getLocalCustomTypes(cwd);
    replaceLegacyCustomTypeMocks(cwd, customTypes, sharedSlices);
  } catch {}
  console.timeEnd(str);
}
