import {
  parseDomain,
  fromUrl,
  ParseResultType,
  ParseResult,
} from "parse-domain";
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

export function extractRepo(parsedRepo: ParseResult): string | undefined {
  switch (parsedRepo.type) {
    case ParseResultType.Listed:
      if (parsedRepo.labels.length) {
        return parsedRepo.labels[0];
      }
      if (parsedRepo.subDomains.length) {
        return parsedRepo.subDomains[0];
      }
    default:
      return;
  }
}

function handleManifest(cwd: string, validate = false): ManifestInfo {
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

  const endpoint = fromUrl(maybeManifest.content.apiEndpoint);
  const parsedRepo = parseDomain(endpoint);
  const repo = extractRepo(parsedRepo);
  return {
    state: ManifestState.Valid,
    message: Messages[ManifestState.Valid],
    content: maybeManifest.content,
    repo,
  };
}

export default handleManifest;
