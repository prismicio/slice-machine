import Files from "@lib/utils/files";
import Environment from "@lib/models/common/Environment";
import * as Core from "@slicemachine/core";

export function generateState(env: Environment): void {
  const libraries = (env.userConfig.libraries || [])
    .map((lib) => Core.Libraries.handleLibraryPath(env.cwd, lib))
    .filter(Boolean) as ReadonlyArray<Core.Models.Library.Library>;

  const state = formatLibraries(libraries);
  Files.write(Core.FileSystem.LibrariesStatePath(env.cwd), state);
}

export function formatLibraries(
  libraries: ReadonlyArray<Core.Models.Library.Library>
): Core.Models.LibrariesState.Libraries {
  const t = libraries.reduce((acc, library) => {
    return { ...acc, [library.name]: formatLibrary(library) };
  }, {});
  return t;
}

export function formatLibrary(
  library: Core.Models.Library.Library
): Core.Models.LibrariesState.Library {
  return library.components.reduce(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(component),
    }),
    {}
  );
}

export function formatComponent(
  slice: Core.Models.Library.Component
): Core.Models.LibrariesState.Component {
  return {
    library: slice.from,
    id: slice.model.id,
    name: slice.infos.meta.name,
    description: slice.infos.meta.description,
    model: slice.model,
    mocks: (
      slice.infos.mock || []
    ).reduce<Core.Models.LibrariesState.ComponentMocks>(
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
