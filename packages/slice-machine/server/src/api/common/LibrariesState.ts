import type Models from "@slicemachine/core/build/src/models";
import Environment from "@lib/models/common/Environment";
import { FileSystem, Libraries, Utils } from "@slicemachine/core";
import probe from "probe-image-size";
const { handleLibraryPath } = Libraries;
const { LibrariesStatePath } = FileSystem;
const { Files } = Utils;

const DEFAULT_IMAGE_DIMENSIONS = {
  width: undefined,
  height: undefined,
};

export function generateState(env: Environment): void {
  const libraries = (env.userConfig.libraries || [])
    .map((lib) => handleLibraryPath(env.cwd, lib))
    .filter(Boolean) as ReadonlyArray<Models.Library<Models.Component>>;

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
    name: library.meta?.displayName,
    version: library.meta?.version,
    components,
  };
}

function getImageDimensions(imagePath: string | undefined) {
  if (!imagePath || Files.exists(imagePath)) return DEFAULT_IMAGE_DIMENSIONS;

  const imageBuffer = Files.readBuffer(imagePath);
  const result = probe.sync(imageBuffer);

  if (!result) return DEFAULT_IMAGE_DIMENSIONS;

  return { width: result.width, height: result.height };
}

export function formatComponent(
  slice: Models.Component
): Models.LibrariesState.Component {
  return {
    library: slice.from,
    id: slice.model.id,
    name: slice.infos.meta.name,
    description: slice.infos.meta.description,
    model: slice.model,
    mocks: (
      slice.infos.mock || []
    ).reduce<Models.LibrariesState.ComponentMocks>(
      (acc, variationMock) => ({
        ...acc,
        [variationMock.variation]: variationMock,
      }),
      {}
    ),
    meta: {
      fileName: slice.infos.fileName,
      isDirectory: slice.infos.isDirectory,
      extension: slice.infos.extension,
    },
    screenshotPaths: !slice.infos.screenshotPaths
      ? {}
      : Object.entries(
          slice.infos.screenshotPaths
        ).reduce<Models.LibrariesState.ComponentScreenshots>(
          (acc, [variationId, screenshot]) => {
            return {
              ...acc,
              [variationId]: {
                exists: screenshot.exists,
                path: screenshot.path,
                ...getImageDimensions(screenshot.path),
              },
            };
          },
          {}
        ),
  };
}
