import * as t from "io-ts";
import { fold } from "fp-ts/lib/Either";
import { Libraries } from "@slicemachine/core";

import { BackendEnvironment } from "@lib/models/common/Environment";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import { LibraryUI } from "@lib/models/common/LibraryUI";
import { Slices, SliceSM } from "@slicemachine/core/build/src/models/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

interface LibrariesResult {
  remoteSlices: ReadonlyArray<SliceSM>;
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
          remoteSlices: [] as Array<SharedSlice>,
          clientError: new ErrorWithStatus(res.statusText, res.status),
        };
      }
      if (!env.isUserLoggedIn) {
        return { remoteSlices: [] as Array<SharedSlice> };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const r = await (res.json ? res.json() : Promise.resolve([]));

      return fold(
        () => ({
          remoteSlices: [] as Array<SharedSlice>,
          clientError: new ErrorWithStatus(
            "Invalid slices detected while fetching.",
            400
          ),
        }),
        (slices: Array<SharedSlice>) => {
          return { remoteSlices: slices };
        }
      )(t.array(SharedSlice).decode(r as unknown));
    })();

    const smRemoteSlices = remoteSlices.map((r) => Slices.toSM(r));

    if (!env.manifest.libraries)
      return {
        remoteSlices: smRemoteSlices,
        libraries: [],
        clientError: clientError,
      };

    const libraries = Libraries.libraries(env.cwd, env.manifest.libraries);

    const withFlags = libraries.map((lib) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      LibraryUI.build(lib, smRemoteSlices, env)
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      clientError: clientError,
      libraries: withFlags,
      remoteSlices: smRemoteSlices,
    };
  } catch (e) {
    return {
      clientError: new ErrorWithStatus("Could not fetch slices", 400),
      libraries: [],
      remoteSlices: [],
    };
  }
}
