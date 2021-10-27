/* eslint-disable */
import { listComponentsByLibrary } from "@lib/queries/listComponents";

import Environment from "@lib/models/common/Environment";
import { Library } from "@lib/models/common/Library";
import Slice from "@lib/models/common/Slice";
import { AsObject } from "@lib/models/common/Variation";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

export async function getLibrariesWithFlags(env: Environment): Promise<{
  remoteSlices: ReadonlyArray<Slice<AsObject>>;
  clientError: ErrorWithStatus | undefined;
  libraries: ReadonlyArray<Library>;
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

    const libraries = await listComponentsByLibrary(env);

    const withFlags = libraries.map((lib) =>
      Library.withStatus(lib, remoteSlices)
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
  remoteSlices: ReadonlyArray<Slice<AsObject>>;
  clientError: ErrorWithStatus | undefined;
  libraries: ReadonlyArray<Library>;
}> {
  return getLibrariesWithFlags(env);
}
