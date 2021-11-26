import type { Models } from "@slicemachine/core";

import Environment from "@lib/models/common/Environment";
import Files from "@slicemachine/core/build/src/utils/files";
import { LibrariesStatePath } from "@slicemachine/core/build/src/filesystem/index";
import { handleLibraryPath } from "@slicemachine/core/build/src/libraries/index";
import probe from "probe-image-size";

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
  return library.components.reduce<Models.LibrariesState.Library>(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(component),
    }),
    {}
  );
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
    previewUrls: !slice.infos.previewUrls
      ? {}
      : Object.entries(
          slice.infos.previewUrls
        ).reduce<Models.LibrariesState.ComponentPreviews>(
          (acc, [variationId, preview]) => {
            return {
              ...acc,
              [variationId]: {
                hasPreview: preview.hasPreview,
                path: preview.path,
                ...getImageDimensions(preview.path),
              },
            };
          },
          {}
        ),
  };
}
