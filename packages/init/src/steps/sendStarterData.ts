import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import * as Libraries from "@slicemachine/core/build/libraries";
import path from "path";
import { sendSlices } from "./starters/slices";
import { InitClient } from "../utils";

export async function sendStarterData(client: InitClient, cwd: string) {
  const manifest = retrieveManifest(cwd);
  const hasDocuments = Files.exists(path.join(cwd, "documents"));

  if (manifest.exists === false || hasDocuments === false)
    return Promise.resolve(false);

  if (
    !manifest.content ||
    !manifest.content.libraries ||
    manifest.content.libraries.length === 0
  )
    return Promise.resolve(false);

  const libs = Libraries.libraries(cwd, manifest.content.libraries);
  return sendSlices(client, libs);
}
