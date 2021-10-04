import fs from "fs";
import path from "path";
import {
  parseDomain,
  fromUrl,
  ParseResultType,
  ParseResult,
} from "parse-domain";
import { Framework } from "@lib/models/common/Framework";

export interface Manifest {
  apiEndpoint: string;
  storybook?: string;
  framework?: Framework;
  chromaticAppId?: string;
  _latest: string;
}

enum ManifestState {
  Valid = "Valid",
  NotFound = "NotFound",
  MissingEndpoint = "MissingEndpoint",
  InvalidEndpoint = "InvalidEndpoint",
  InvalidJson = "InvalidJson",
}

interface ManifestStates {
  [x: string]: string;
}

export const ManifestStates: ManifestStates = {
  Valid: "Valid",
  NotFound: "NotFound",
  MissingEndpoint: "MissingEndpoint",
  InvalidEndpoint: "InvalidEndpoint",
  InvalidJson: "InvalidJson",
};

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
    case ParseResultType.Reserved:
      if (parsedRepo.labels.length) {
        return parsedRepo.labels[0];
      }
    default:
      return;
  }
}

function validateEndpoint(endpoint: string, parsedRepo: ParseResult) {
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
      case ParseResultType.Reserved: {
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

function validate(manifest: Manifest) {
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

function handleManifest(cwd: string) {
  const pathToSm = path.join(cwd, "sm.json");
  if (!fs.existsSync(pathToSm)) {
    return {
      state: ManifestState.NotFound,
      message: Messages[ManifestState.NotFound],
      content: null,
    };
  }

  const { userConfig, err } = (() => {
    try {
      const f = fs.readFileSync(pathToSm, "utf-8");
      return {
        userConfig: JSON.parse(f),
        err: null,
      };
    } catch (e) {
      return {
        userConfig: null,
        err: e,
      };
    }
  })();

  if (err) {
    return {
      state: ManifestState.InvalidJson,
      message: Messages[ManifestState.InvalidJson],
      content: null,
    };
  }
  return validate(userConfig);
}

export default handleManifest;
