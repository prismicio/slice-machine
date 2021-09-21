import { getEnv } from "@lib/env";
import push from "./slices/push";
import getLibs from "./libraries";

export default async function handler() {
  const { env } = await getEnv();
  const { libraries } = await getLibs(env);
  const allSlices = libraries.reduce((acc, curr) => {
    return [...acc, ...curr[1]];
  }, []);

  const res = {};
  for (let slice of allSlices) {
    res[slice.sliceName] = await push(slice);
  }
  return res;
}
