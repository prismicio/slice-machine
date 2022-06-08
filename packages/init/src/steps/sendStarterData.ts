import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import * as Libraries from "@slicemachine/core/build/libraries";
import path from "path";
import { getEndpointsFromBase } from "./starters/endpoints";
import { sendSlices } from "./starters/slices";

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

  const endpoints = getEndpointsFromBase(base);

  const authTokenFromCookie = parsePrismicAuthToken(cookies);
  const authorization = `Bearer ${authTokenFromCookie}`;

  if (!smJson.content || !smJson.content.libraries)
    return Promise.resolve(false);

  const libs = Libraries.libraries(cwd, smJson.content.libraries);
  return sendSlices(endpoints, repository, authorization, libs);
}
