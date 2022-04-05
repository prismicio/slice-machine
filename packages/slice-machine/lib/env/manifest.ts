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
  InvalidFramework = "InvalidFramework",
}

const Messages = {
  [ManifestState.Valid]: "Manifest is correctly setup.",
  [ManifestState.NotFound]: "Could not find manifest file (./sm.json).",
  [ManifestState.MissingEndpoint]:
    'Property "apiEndpoint" is missing in manifest (./sm.json).',
  [ManifestState.InvalidEndpoint]:
    'Property "apiEndpoint" is invalid (./sm.json).',
  [ManifestState.InvalidJson]: "Could not parse manifest (./sm.json).",
  [ManifestState.InvalidFramework]: `Property "framework" in (./sm.json) must be one of "${Object.values(
    Models.Frameworks
  ).join('", "')}". Or remove it and SM will guess`,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = JSON.parse(f);

    return pipe(
      Models.Manifest.decode(json),
      fold<t.Errors, Models.Manifest, ManifestInfo>(
        // failure handler
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
        // success handler
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
  } catch (e) {
    return {
      state: ManifestState.InvalidJson,
      message: Messages[ManifestState.InvalidJson],
      content: null,
    };
  }
}

export default handleManifest;
