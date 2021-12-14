import fs from "fs";
import path from "path";
import {
  parseDomain,
  fromUrl,
  ParseResultType,
  ParseResult,
} from "parse-domain";
import { Models } from "@slicemachine/core";
import { fold } from "fp-ts/Either";
import { pipe } from "fp-ts/function";

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

function validateEndpoint(endpoint: string, parsedRepo: ParseResult): boolean {
  try {
    switch (parsedRepo.type) {
      case ParseResultType.Listed: {
        if (!parsedRepo?.subDomains?.length) {
          return false;
        }
        if (!endpoint.endsWith("api/v2") && !endpoint.endsWith("api/v2/")) {
          return false;
        }
        return true;
      }
      default: {
        return false;
      }
    }
  } catch (e) {
    const message =
      "[api/env]: Unrecoverable error. Could not parse api endpoint. Exiting..";
    console.error(message);
    return false;
  }
}

function validate(manifest: Models.Manifest): ManifestInfo {
  if (!manifest.apiEndpoint) {
    return {
      state: ManifestState.MissingEndpoint,
      message: Messages[ManifestState.MissingEndpoint],
      content: null,
    };
  }
  const endpoint = fromUrl(manifest.apiEndpoint);
  const parsedRepo = parseDomain(endpoint);
  if (!validateEndpoint(manifest.apiEndpoint, parsedRepo)) {
    return {
      state: ManifestState.InvalidEndpoint,
      message: Messages[ManifestState.InvalidEndpoint],
      content: null,
    };
  }
  const repo = extractRepo(parsedRepo);
  if (!repo) {
    return {
      state: ManifestState.InvalidEndpoint,
      message: Messages[ManifestState.InvalidEndpoint],
      content: null,
    };
  }
  return {
    state: ManifestState.Valid,
    message: Messages[ManifestState.Valid],
    content: manifest,
    repo,
  };
}

function handleManifest(cwd: string): ManifestInfo {
  const pathToSm = path.join(cwd, "sm.json");
  if (!fs.existsSync(pathToSm)) {
    return {
      state: ManifestState.NotFound,
      message: Messages[ManifestState.NotFound],
      content: null,
    };
  }

  try {
    const f = fs.readFileSync(pathToSm, "utf-8");
    const json = JSON.parse(f);

    return pipe(
      Models.Manifest.decode(json),
      fold(
        // failure handler
        () => {
          throw new Error();
        },
        // success handler
        (manifest) => validate(manifest)
      )
    );
  } catch (e) {
    return {
      state: ManifestState.InvalidJson,
      message: Messages[ManifestState.InvalidJson],
      content: null,
    };
  }
}

export default handleManifest;
