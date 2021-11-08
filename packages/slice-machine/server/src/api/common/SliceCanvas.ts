import { getOrElseW } from "fp-ts/Either";

import Files from "@lib/utils/files";
import Environment from "@lib/models/common/Environment";
import * as Core from '@slicemachine/core'

function stateExists(cwd: string) {
  return Files.exists(Core.FileSystem.SliceCanvasStatePath(cwd));
}

export async function generateState(env: Environment) {
  console.log('generate state')
  const libraries = (env.userConfig.libraries || [])
    .map(lib => Core.Libraries.handleLibraryPath(env.cwd, lib))
    .filter(Boolean) as ReadonlyArray<Core.Models.Library.Library>;

  const state = formatLibraries(libraries);
  Files.write(Core.FileSystem.SliceCanvasStatePath(env.cwd), state);
}

export function updateStateForSlice(env: Environment) {
  return async (
    libraryFrom: string,
    model: Core.Models.Slice<Core.Models.AsObject>,
    mock: Core.Models.SliceMock,
    previewUrls: Record<string, Core.Models.Library.Preview>
  ): Promise<Error | void> => {
    if (!stateExists(env.cwd)) generateState(env);
    // will be invoked on first slice or for existing project who never got this code active before.
    else {
      const statePath = Core.FileSystem.SliceCanvasStatePath(env.cwd);
      const stateOrDefault =
        Files.readEntity<Core.Models.SliceCanvas.GlobalState>(statePath, (payload: any) =>
          getOrElseW(() => new Error(`[SliceCanvasState] Invalid structure`))(
            Core.Models.SliceCanvas.GlobalState.decode(payload)
          )
        ) || {};

      if (stateOrDefault instanceof Error) {
        return stateOrDefault;
      } else {
        const output: Core.Models.SliceCanvas.GlobalState = {
          ...stateOrDefault,
          [libraryFrom]: {
            ...stateOrDefault[libraryFrom],
            [model.id]: formatComponent(model, mock, previewUrls),
          },
        };

        Files.write(statePath, output);
      }
    }
  };
}

export function formatLibraries(
  libraries: ReadonlyArray<Core.Models.Library.Library>
): Core.Models.SliceCanvas.GlobalState {
  return libraries.reduce((acc, library) => {
    return { ...acc, [library.name]: formatLibrary(library) };
  }, {});
}

export function formatLibrary(library: Core.Models.Library.Library): {
  [sliceId: string]: Core.Models.SliceCanvas.SliceState;
} {
  console.log(library.components)
  return library.components.reduce(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(
        component.model,
        component.infos.mock,
        component.infos.previewUrls
      ),
    }),
    {}
  );
}

export function formatComponent(
  model: Core.Models.Slice<Core.Models.AsObject>,
  mock?: Core.Models.SliceMock,
  previewUrls?: Record<string, Core.Models.Library.Preview>
): Core.Models.SliceCanvas.SliceState {
  return {
    model,
    mock: (mock || []).reduce<Record<string, Core.Models.VariationMock>>(
      (acc, variationMock) => ({
        ...acc,
        [variationMock.variation]: variationMock,
      }),
      {}
    ),
    previewURLs: !previewUrls
      ? {}
      : Object.entries(previewUrls).reduce<{
          [variationId: string]: {
            hasPreview: boolean;
            path: string | undefined;
          };
        }>((acc, [variationId, preview]) => {
          return {
            ...acc,
            [variationId]: {
              hasPreview: preview.hasPreview,
              path: preview.url,
            },
          };
        }, {}),
  };
}
