import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import path from "path";
import { sendSlices } from "./starters/slices";
import { sendCustomTypes } from "./starters/custom-types";
import { InitClient } from "../utils";

export async function sendStarterData(client: InitClient, cwd: string) {
  const manifest = retrieveManifest(cwd);
  const hasDocuments = Files.exists(path.join(cwd, "documents"));

  if (manifest.exists === false || hasDocuments === false)
    return Promise.resolve(false);

  if (manifest.content) await sendSlices(client, cwd, manifest.content);
  return sendCustomTypes(client, cwd);
}
