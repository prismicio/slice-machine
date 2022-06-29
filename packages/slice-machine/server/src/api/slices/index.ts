import getEnv from "../services/getEnv";

import type { Client, ClientError } from "@slicemachine/client";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

export const getSlices = async (
  client: Client
): Promise<{
  err: ClientError | null;
  slices: Array<SliceSM>;
}> => {
  return client
    .getSlices()
    .then((slices: SharedSlice[]) => ({
      slices: slices.map((s) => Slices.toSM(s)),
      err: null,
    }))
    .catch((e: ClientError) => ({ slices: [], err: e }));
};

export default async function handler() {
  const { env } = await getEnv();
  return await getSlices(env.client);
}
