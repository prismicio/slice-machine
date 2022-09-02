import * as Libraries from "@slicemachine/core/build/libraries";

import { BackendEnvironment } from "../../../lib/models/common/Environment";

import ErrorWithStatus from "../../../lib/models/common/ErrorWithStatus";

import { LibraryUI } from "../../../lib/models/common/LibraryUI";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import { ClientError } from "@slicemachine/client";

interface LibrariesResult {
  remoteSlices: ReadonlyArray<SliceSM>;
  libraries: ReadonlyArray<LibraryUI>;
  clientError?: ErrorWithStatus;
}

export default async function handler(
  env: BackendEnvironment
): Promise<LibrariesResult> {
  try {
    const { remoteSlices, clientError } = await env.client
      .getSlices()
      .then((slices) => ({
        remoteSlices: slices.map((slice) => Slices.toSM(slice)),
        clientError: undefined,
      }))
      .catch((error: ClientError) => ({
        remoteSlices: [],
        clientError: new ErrorWithStatus(error.message, error.status),
      }));

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
