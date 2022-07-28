import type Models from "@slicemachine/core/build/models";
import { BackendEnvironment } from "@lib/models/common/Environment";
import probe from "probe-image-size";
import { Slices } from "@slicemachine/core/build/models/Slice";
import { handleLibraryPath } from "@slicemachine/core/build/libraries";
import { LibrariesStatePath, Files } from "@slicemachine/core/build/node-utils";
import { renderSliceMock } from "@prismicio/mocks";

const DEFAULT_IMAGE_DIMENSIONS = {
  width: undefined,
  height: undefined,
};

export function generateState(
  env: BackendEnvironment,
  libs?: readonly Models.Library<Models.Component>[]
): void {
  const libraries =
    libs ||
    ((env.manifest.libraries || [])
      .map((lib) => handleLibraryPath(env.cwd, lib))
      .filter(Boolean) as ReadonlyArray<Models.Library<Models.Component>>);

  const state = formatLibraries(libraries);
  Files.write(LibrariesStatePath(env.cwd), state);
}

export function formatLibraries(
  libraries: ReadonlyArray<Models.Library<Models.Component>>
): Models.LibrariesState.Libraries {
  return libraries.reduce<Models.LibrariesState.Libraries>((acc, library) => {
    return { ...acc, [library.name]: formatLibrary(library) };
  }, {});
}

export function formatLibrary(
  library: Models.Library<Models.Component>
): Models.LibrariesState.Library {
  const components = library.components.reduce<
    Models.LibrariesState.Library["components"]
  >(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(component),
    }),
    {}
  );

  return {
    name: library.meta?.name,
    version: library.meta?.version,
    components,
  };
}

function getImageDimensions(imagePath: string | undefined) {
  if (!imagePath || !Files.exists(imagePath)) return DEFAULT_IMAGE_DIMENSIONS;

  const imageBuffer = Files.readBuffer(imagePath);
  const result = probe.sync(imageBuffer);

  if (!result) return DEFAULT_IMAGE_DIMENSIONS;

  return { width: result.width, height: result.height };
}

export function formatComponent(
  slice: Models.Component
): Models.LibrariesState.Component {
  const model = Slices.fromSM(slice.model);
  return {
    library: slice.from,
    id: slice.model.id,
    name: slice.model.name,
    description: slice.model.description,
    model,
    mocks: (
      slice.mock || []
    ).reduce<Models.LibrariesState.ComponentMocksRecord>(
      (acc, variationMock) => ({
        ...acc,
        [variationMock.variation]: renderSliceMock(
          model,
          variationMock
        ) as Models.VariationMock,
      }),
      {}
    ),
    meta: {
      fileName: slice.fileName,
      extension: slice.extension,
    },
    screenshotPaths: !slice.screenshotPaths
      ? {}
      : Object.entries(
          slice.screenshotPaths
        ).reduce<Models.LibrariesState.ComponentScreenshots>(
          (acc, [variationId, screenshot]) => {
            return {
              ...acc,
              [variationId]: {
                path: screenshot.path,
                ...getImageDimensions(screenshot.path),
              },
            };
          },
          {}
        ),
  };
}
