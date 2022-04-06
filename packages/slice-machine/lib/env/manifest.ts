import {
  parseDomain,
  fromUrl,
  ParseResultType,
  ParseResult,
} from "parse-domain";
import { Models } from "@slicemachine/core";
import { retrieveManifest } from "@slicemachine/core/build/node-utils";
import { fold } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
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
  MissingEndpoint = "MissingEndpoint",
  InvalidEndpoint = "InvalidEndpoint",
  InvalidJson = "InvalidJson",
}

const Messages = {
  [ManifestState.Valid]: "Manifest is correctly setup.",
  [ManifestState.NotFound]: "Could not find manifest file (./sm.json).",
  [ManifestState.MissingEndpoint]:
    'Property "apiEndpoint" is missing in manifest (./sm.json).',
  [ManifestState.InvalidEndpoint]:
    'Property "apiEndpoint" is invalid (./sm.json).',
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

function handleManifest(cwd: string): ManifestInfo {
  const maybeManifest = retrieveManifest(cwd);
  if (maybeManifest.exists === false) {
    return {
      state: ManifestState.NotFound,
      message: Messages[ManifestState.NotFound],
      content: null,
    };
  }
  return pipe(
    Models.Manifest.decode(maybeManifest.content),
    fold<t.Errors, Models.Manifest, ManifestInfo>(
      (errors) => {
        const messages = formatValidationErrors(errors, {});
        const message = messages
          .map((error) => "[sm.json] " + error)
          .join("\n");

        return {
          state: ManifestState.InvalidJson,
          message,
          content: null,
        };
      },
      (manifest) => {
        const endpoint = fromUrl(manifest.apiEndpoint);
        const parsedRepo = parseDomain(endpoint);
        const repo = extractRepo(parsedRepo);
        return {
          state: ManifestState.Valid,
          message: Messages[ManifestState.Valid],
          content: manifest,
          repo,
        };
      }
    )
  );
}

export default handleManifest;
