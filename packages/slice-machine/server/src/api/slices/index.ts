import getEnv from "../services/getEnv";

import type Models from "@slicemachine/core/build/src/models";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import FakeClient, { FakeResponse } from "@lib/models/common/http/FakeClient";

export const getSlices = async (
  client: DefaultClient | FakeClient
): Promise<{
  err: Response | FakeResponse | null;
  slices: Models.SliceAsObject[];
}> => {
  try {
    const res = await client.getSlice();
    if (res.status !== 200) {
      return { err: res, slices: [] };
    }
    const slices: Models.SliceAsObject[] = await res.json();
    return { err: null, slices };
  } catch (e) {
    return { slices: [], err: e as Response };
  }
};
export default async function handler() {
  const { env } = await getEnv();
  return await getSlices(env.client);
}
