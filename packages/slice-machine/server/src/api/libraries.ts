import { Libraries, Models } from "@slicemachine/core";

import Environment from "@lib/models/common/Environment";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import { LibraryUI } from "@lib/models/common/LibraryUI";

export async function getLibrariesWithFlags(env: Environment): Promise<{
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError: ErrorWithStatus | undefined;
  libraries: ReadonlyArray<LibraryUI>;
}> {
  try {
    const res = await env.client.getSlice();
    const { remoteSlices, clientError } = await (async () => {
      if (res.status > 209) {
        return {
          remoteSlices: [],
          clientError: new ErrorWithStatus(res.statusText, res.status),
        };
      }
      if (env.client.isFake()) {
        return { remoteSlices: [] };
      }
      const r = await (res.json ? res.json() : Promise.resolve([]));
      return { remoteSlices: r };
    })();

    const libraries = await Libraries.libraries(
      env.cwd,
      env.userConfig.libraries || []
    );

    const withFlags = libraries.map((lib) =>
      LibraryUI.build(lib, remoteSlices)
    );
    return { clientError, libraries: withFlags, remoteSlices };
  } catch (e) {
    return {
      clientError: new ErrorWithStatus("Could not fetch slices", 400),
      libraries: [],
      remoteSlices: [],
    };
  }
}

export default async function handler(env: Environment): Promise<{
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError: ErrorWithStatus | undefined;
  libraries: ReadonlyArray<LibraryUI>;
}> {
  return getLibrariesWithFlags(env);
}
