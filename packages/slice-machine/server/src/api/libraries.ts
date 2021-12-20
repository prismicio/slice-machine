import { Libraries, Models } from "@slicemachine/core";

import { BackendEnvironment } from "@lib/models/common/Environment";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import { LibraryUI } from "@lib/models/common/LibraryUI";

interface LibrariesResult {
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError: ErrorWithStatus | undefined;
  libraries: ReadonlyArray<LibraryUI> | undefined;
}

export default async function handler(
  env: BackendEnvironment
): Promise<LibrariesResult> {
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

    if (!env.manifest.libraries)
      return { remoteSlices, libraries: undefined, clientError };

    const libraries = Libraries.libraries(env.cwd, env.manifest.libraries);

    const withFlags = libraries.map((lib) =>
      LibraryUI.build(lib, remoteSlices, env)
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
