import { getEnv } from "@lib/env";

import DefaultClient from "@lib/models/common/http/DefaultClient";
import FakeClient, { FakeResponse } from "@lib/models/common/http/FakeClient";
import Slice from "@models/common/Slice";
import { AsObject } from "@models/common/Variation";

export const getSlices = async (
  client: DefaultClient | FakeClient
): Promise<{
  err: Response | FakeResponse | null;
  slices: Slice<AsObject>[];
}> => {
  try {
    const res = await client.getSlice();
    if (res.status !== 200) {
      return { err: res, slices: [] };
    }
    const slices: Slice<AsObject>[] = await res.json();
    return { err: null, slices };
  } catch (e) {
    return { slices: [], err: e };
  }
};
export default async function handler() {
  const { env } = await getEnv();
  return await getSlices(env.client);
}
