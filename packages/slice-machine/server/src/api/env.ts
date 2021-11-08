import getEnv from "./services/getEnv";

export default async function handler() {
  return getEnv();
}
