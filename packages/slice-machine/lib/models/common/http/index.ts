import DefaultClient from "./DefaultClient";

function initClient(
  cwd: string,
  base: string,
  repo: string,
  auth?: string
): DefaultClient {
  return new DefaultClient(cwd, base, repo, auth || "");
}

export default initClient;
