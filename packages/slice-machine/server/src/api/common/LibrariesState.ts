import Environment from "@lib/models/common/Environment";
import type { Models } from "@slicemachine/core";
import { FileSystem, Libraries, Utils } from "@slicemachine/core";
import probe from "probe-image-size";

const DEFAULT_IMAGE_DIMENSIONS = {
  width: undefined,
  height: undefined,
};

export function generateState(env: Environment): void {
  const libraries = (env.userConfig.libraries || [])
    .map((lib) => Libraries.handleLibraryPath(env.cwd, lib))
    .filter(Boolean) as ReadonlyArray<Models.Library.Library>;

  const state = formatLibraries(libraries);
  Utils.Files.write(FileSystem.LibrariesStatePath(env.cwd), state);
}

export function formatLibraries(
  libraries: ReadonlyArray<Models.Library.Library>
): Models.LibrariesState.Libraries {
  const t = libraries.reduce((acc, library) => {
    return { ...acc, [library.name]: formatLibrary(library) };
  }, {});
  return t;
}

export function formatLibrary(
  library: Models.Library.Library
): Models.LibrariesState.Library {
  return library.components.reduce(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(component),
    }),
    {}
  );
}

function getImageDimensions(imagePath: string | undefined) {
  if (!imagePath || !Utils.Files.exists(imagePath))
    return DEFAULT_IMAGE_DIMENSIONS;

  const imageBuffer = Utils.Files.readBuffer(imagePath);
  const result = probe.sync(imageBuffer);

  if (!result) return DEFAULT_IMAGE_DIMENSIONS;

  return { width: result.width, height: result.height };
}

export function formatComponent(
  slice: Models.Library.Component
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
