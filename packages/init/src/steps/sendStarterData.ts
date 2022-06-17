import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import path from "path";
import { sendSlicesFromStarter } from "./starters/slices";
import { sendCustomTypesFromStarter } from "./starters/custom-types";
import { sendDocumentsFromStarter } from "./starters/documents";

export async function sendStarterData(
  repository: string,
  base: string,
  cookies: string,
  cwd: string
): Promise<boolean> {
  const smJson = retrieveManifest(cwd);
  const hasDocuments = Files.exists(path.join(cwd, "documents"));

  if (smJson.exists === false || hasDocuments === false)
    return Promise.resolve(false);

  const authTokenFromCookie = parsePrismicAuthToken(cookies);

  if (smJson.content && smJson.content.libraries) {
    await sendSlicesFromStarter(
      base,
      repository,
      authTokenFromCookie,
      smJson.content.libraries,
      cwd
    );
  }

  await sendCustomTypesFromStarter(repository, authTokenFromCookie, base, cwd);

  return sendDocumentsFromStarter(repository, cookies, base, cwd);
}
