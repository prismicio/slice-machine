import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import path from "path";
import { sendSlicesFromStarter } from "./starters/slices";
import { sendCustomTypesFromStarter } from "./starters/custom-types";

export async function sendStarterData(
  repository: string,
  base: string,
  cookies: string,
  cwd: string
) {
  const smJson = retrieveManifest(cwd);
  const hasDocuments = Files.exists(path.join(cwd, "documents"));

  if (smJson.exists === false || hasDocuments === false)
    return Promise.resolve(false);

  const authTokenFromCookie = parsePrismicAuthToken(cookies);

  if (!smJson.content || !smJson.content.libraries) {
    return Promise.resolve(false);
  } else {
    await sendSlicesFromStarter(
      base,
      repository,
      authTokenFromCookie,
      smJson.content.libraries,
      cwd
    );
  }

  return sendCustomTypesFromStarter(repository, authTokenFromCookie, base, cwd);
}
