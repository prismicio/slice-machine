import * as t from "io-ts";
import { fold } from "fp-ts/lib/Either";
import * as Libraries from "@slicemachine/core/build/libraries";

import { BackendEnvironment } from "@lib/models/common/Environment";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import { LibraryUI } from "@lib/models/common/LibraryUI";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

interface LibrariesResult {
  remoteSlices: ReadonlyArray<SliceSM>;
  libraries: ReadonlyArray<LibraryUI>;
  clientError?: ErrorWithStatus;
}

async function getAndValidateSlices(
  env: BackendEnvironment
): Promise<{
  remoteSlices: LibrariesResult["remoteSlices"];
  clientError?: LibrariesResult["clientError"];
}> {
  const response: Response = await env.client.getSlice();

  if (response.status > 209) {
    return {
      remoteSlices: [],
      clientError: new ErrorWithStatus(response.statusText, response.status),
    };
  }

  const json: unknown = await (response.json
    ? response.json()
    : Promise.resolve([]));

  return fold(
    () => ({
      remoteSlices: [],
      clientError: new ErrorWithStatus(
        "Invalid slices detected while fetching.",
        400
      ),
    }),
    (slices: Array<SharedSlice>) => {
      const smSlices = slices.map((r) => Slices.toSM(r));

      return { remoteSlices: smSlices };
    }
  )(t.array(SharedSlice).decode(json));
}

export default async function handler(
  env: BackendEnvironment
): Promise<LibrariesResult> {
  try {
    const { remoteSlices, clientError } = await getAndValidateSlices(env);

    if (!env.manifest.libraries)
      return {
        remoteSlices: remoteSlices,
        libraries: [],
        clientError: clientError,
      };

    const libraries = Libraries.libraries(env.cwd, env.manifest.libraries);

    const withFlags = libraries.map((lib) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      LibraryUI.build(lib, remoteSlices, env)
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      clientError: clientError,
      libraries: withFlags,
      remoteSlices: remoteSlices,
    };
  } catch (e) {
    return {
      clientError: new ErrorWithStatus("Could not fetch slices", 400),
      libraries: [],
      remoteSlices: [],
    };
  }
}
