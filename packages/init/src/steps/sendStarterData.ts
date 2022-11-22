import {
  retrieveManifest,
  Files,
} from "@prismic-beta/slicemachine-core/build/node-utils";
import path from "path";
import fs from "fs";
import { sendSlices } from "./starters/slices";
import { sendCustomTypes } from "./starters/custom-types";
import { sendDocuments } from "./starters/documents";
import { InitClient } from "../utils";

export async function sendStarterData(
  client: InitClient,
  cwd: string,
  pushDocuments = true
) {
  const manifest = retrieveManifest(cwd);
  const documentsPath = path.join(cwd, "documents");
  const hasDocuments = Files.exists(documentsPath);

  if (manifest.exists === false || hasDocuments === false)
    return Promise.resolve(false);

  if (manifest.content) await sendSlices(client, cwd, manifest.content);
  await sendCustomTypes(client, cwd);

  // If the user choose not to push documents, we still delete the documents folder.
  if (!pushDocuments) {
    fs.rmSync(documentsPath, { recursive: true, force: true });
    return Promise.resolve(true);
  }

  return sendDocuments(client, cwd);
}
