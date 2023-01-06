import { Models } from "@slicemachine/core";
import { retrieveManifest } from "@slicemachine/core/build/node-utils";
import { formatValidationErrors } from "io-ts-reporters";

export interface ManifestInfo {
  state: ManifestState;
  message: string;
  content: Models.Manifest | null;
  repo?: string;
}

export enum ManifestState {
  Valid = "Valid",
  NotFound = "NotFound",
  InvalidJson = "InvalidJson",
}

const Messages = {
  [ManifestState.Valid]: "Manifest is correctly setup.",
  [ManifestState.NotFound]: "Could not find manifest file (./sm.json).",
  [ManifestState.InvalidJson]: "Could not parse manifest (./sm.json).",
};

function handleManifest(cwd: string, validate = false): ManifestInfo {
  try {
    const maybeManifest = retrieveManifest(cwd, validate);
    if (maybeManifest.exists === false) {
      return {
        state: ManifestState.NotFound,
        message: Messages[ManifestState.NotFound],
        content: null,
      };
    }

    if (maybeManifest.errors) {
      const messages = formatValidationErrors(maybeManifest.errors, {});
      const message = messages.map((error) => "[sm.json] " + error).join("\n");

      return {
        state: ManifestState.InvalidJson,
        message,
        content: null,
      };
    }

    if (maybeManifest.content === null) {
      return {
        state: ManifestState.InvalidJson,
        message: Messages[ManifestState.InvalidJson],
        content: null,
      };
    }

    const endpoint = new URL(maybeManifest.content.apiEndpoint);
    const repo = endpoint.hostname.split(".")[0];

    return {
      state: ManifestState.Valid,
      message: Messages[ManifestState.Valid],
      content: maybeManifest.content,
      repo,
    };
  } catch (e) {
    return {
      state: ManifestState.InvalidJson,
      message: Messages[ManifestState.InvalidJson],
      content: null,
    };
  }
}

export default handleManifest;
