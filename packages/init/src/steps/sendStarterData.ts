import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import path from "path";
import { sendSlicesFromStarter } from "./starters/slices";
import { sendCustomTypesFromStarter } from "./starters/custom-types";
import { sendDocumentsFromStarter } from "./starters/documents";
import fs from "fs";

export async function sendStarterData(
  repository: string,
  base: string,
  cookies: string,
  sendDocs = true,
  cwd: string
): Promise<boolean> {
  const smJson = retrieveManifest(cwd);
  const pathToDocuments = path.join(cwd, "documents");
  const hasDocuments = Files.exists(pathToDocuments);

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

  if (sendDocs === false) {
    fs.rmSync(pathToDocuments, { recursive: true, force: true });
    return Promise.resolve(true);
  }

  return sendDocumentsFromStarter(repository, cookies, base, cwd);
}
