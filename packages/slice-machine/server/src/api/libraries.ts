import { Models } from "@slicemachine/core";
import * as Libraries from "@slicemachine/core/build/libraries";

import { BackendEnvironment } from "@lib/models/common/Environment";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import { LibraryUI } from "@lib/models/common/LibraryUI";

interface LibrariesResult {
  remoteSlices: ReadonlyArray<Models.SliceAsObject>;
  clientError: ErrorWithStatus | undefined;
  libraries: ReadonlyArray<LibraryUI>;
}

export default async function handler(
  env: BackendEnvironment
): Promise<LibrariesResult> {
  try {
    const res = await env.client.getSlice();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { remoteSlices, clientError } = await (async () => {
      if (res.status > 209) {
        return {
          remoteSlices: [],
          clientError: new ErrorWithStatus(res.statusText, res.status),
        };
      }
      if (!env.isUserLoggedIn) {
        return { remoteSlices: [] };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const r = await (res.json ? res.json() : Promise.resolve([]));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { remoteSlices: r };
    })();

    if (!env.manifest.libraries)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { remoteSlices, libraries: [], clientError };

    const libraries = Libraries.libraries(env.cwd, env.manifest.libraries);

    const withFlags = libraries.map((lib) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      LibraryUI.build(lib, remoteSlices, env)
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { clientError, libraries: withFlags, remoteSlices };
  } catch (e) {
    return {
      clientError: new ErrorWithStatus("Could not fetch slices", 400),
      libraries: [],
      remoteSlices: [],
    };
  }
}
