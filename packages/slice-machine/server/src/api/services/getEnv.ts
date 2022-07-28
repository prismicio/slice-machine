import getEnv from "../../../../lib/env/getEnv";

export default async function handler() {
  return getEnv();
}
