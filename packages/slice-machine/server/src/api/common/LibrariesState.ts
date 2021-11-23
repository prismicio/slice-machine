import Files from "@lib/utils/files";
import Environment from "@lib/models/common/Environment";
import type { Models } from "@slicemachine/core";
import { handleLibraryPath } from "@slicemachine/core/build/src/libraries/index";
import { LibrariesStatePath } from "@slicemachine/core/build/src/filesystem/index";

export function generateState(env: Environment): void {
  const libraries = (env.userConfig.libraries || [])
    .map((lib) => handleLibraryPath(env.cwd, lib))
    .filter(Boolean) as ReadonlyArray<Models.Library<Models.Component>>;

  const state = formatLibraries(libraries);
  Files.write(LibrariesStatePath(env.cwd), state);
}

export function formatLibraries(
  libraries: ReadonlyArray<Models.Library<Models.Component>>
): Models.LibrariesState.Library {
  return libraries.reduce((acc, library) => {
    return { ...acc, [library.name]: formatLibrary(library) };
  }, {});
}

export function formatLibrary(library: Models.Library<Models.Component>): {
  [sliceId: string]: Models.LibrariesState.Component;
} {
  return library.components.reduce(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(component),
    }),
    {}
  );
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
      : Object.entries(slice.infos.previewUrls).reduce<{
          [variationId: string]: {
            hasPreview: boolean;
            path: string | undefined;
          };
        }>((acc, [variationId, preview]) => {
          return {
            ...acc,
            [variationId]: {
              hasPreview: preview.hasPreview,
              path: preview.path,
            },
          };
        }, {}),
  };
}
