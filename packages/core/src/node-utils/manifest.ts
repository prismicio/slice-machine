import Files from "./files";
import { FileContent, SMConfigPath } from "./paths";
import { Manifest } from "../models/Manifest";
import { formatValidationErrors } from "io-ts-reporters";
import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold } from "fp-ts/Either";

export function createManifest(cwd: string, manifest: Manifest): void {
  const manifestPath = SMConfigPath(cwd);
  Files.write(manifestPath, manifest, { recursive: false });
}

export function retrieveManifest(
  cwd: string,
  validate = false
): FileContent<Manifest, t.Errors> {
  const manifestPath = SMConfigPath(cwd);

  if (!Files.exists(manifestPath)) {
    return {
      exists: false,
      content: null,
    };
  }

  const content: Manifest | null = Files.safeReadJson(
    manifestPath
  ) as Manifest | null;

  if (validate === false) {
    return {
      exists: true,
      content,
    };
  }

  if (!content) {
    throw new Error("Could not parse sm.json");
  }

  return pipe(
    Manifest.decode(content),
    fold<t.Errors, Manifest, FileContent<Manifest, t.Errors>>(
      (errors) => {
        return { exists: true, content: null, errors };
      },
      (manifest) => ({ exists: true, content: manifest })
    )
  );
}

export function maybeRepoNameFromSMFile(
  cwd: string,
  base: string
): string | null {
  try {
    const baseUrl = new URL(base);
    const maybeSMFile = retrieveManifest(cwd);

    if (maybeSMFile.exists === false) return null;
    if (!maybeSMFile.content?.apiEndpoint) return null;

    const repoUrl = new URL(maybeSMFile.content.apiEndpoint);
    const correctBase = repoUrl.hostname.includes(baseUrl.hostname);
    if (correctBase === false) return null;

    return repoUrl.hostname.split(".")[0];
  } catch {
    return null;
  }
}

export function patchManifest(cwd: string, data: Partial<Manifest>): boolean {
  const manifest = retrieveManifest(cwd);
  if (!manifest.exists || !manifest.content) return false;

  const updatedManifest = {
    ...manifest.content,
    ...data,
  };

  Files.write(SMConfigPath(cwd), updatedManifest);
  return true;
}

export function updateManifestSMVersion(cwd: string, version: string): boolean {
  const maybeManifest = retrieveManifest(cwd);

  if (maybeManifest.errors) {
    const messages = formatValidationErrors(maybeManifest.errors);
    messages.forEach((message) => {
      console.log("[core/sm.json] " + message);
    });
  }

  const content = maybeManifest.content;

  if (content?._latest) return false; // if _latest already exists, we should not update this version otherwise we'd break the migration system

  return patchManifest(cwd, { _latest: version });
}
