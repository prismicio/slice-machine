import getEnv from "../services/getEnv";

import { Client } from "@lib/models/server/Client";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

export const getSlices = async (
  client: Client
): Promise<{
  err: Response | null;
  slices: Array<SliceSM>;
}> => {
  try {
    const res = await client.getSlice();
    if (res.status !== 200) {
      return { err: res, slices: [] };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const slices: Array<SharedSlice> = await res.json();
    return { err: null, slices: slices.map((s) => Slices.toSM(s)) };
  } catch (e) {
    return { slices: [], err: e as Response };
  }
};

export default async function handler() {
  const { env } = await getEnv();
  return await getSlices(env.client);
}
