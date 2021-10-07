import { Framework } from "../../utils/framework";
import Files from '../../utils/files'
import { FileContent, SMConfigPath } from './paths';

export interface Manifest {
  apiEndpoint: string;
  storybook?: string;
  framework?: Framework;
  chromaticAppId?: string;
  _latest?: string;
}

export enum ManifestStates {
  Valid = "Valid",
  NotFound = "NotFound",
  MissingEndpoint = "MissingEndpoint",
  InvalidEndpoint = "InvalidEndpoint",
  InvalidJson = "InvalidJson",
}

/*export const Messages = {
  [ManifestState.Valid]: "Manifest is correctly setup.",
  [ManifestState.NotFound]: "Could not find manifest file (./sm.json).",
  [ManifestState.MissingEndpoint]:
    'Property "apiEndpoint" is missing in manifest (./sm.json).',
  [ManifestState.InvalidEndpoint]:
    'Property "apiEndpoint" is invalid (./sm.json).',
  [ManifestState.InvalidJson]: "Could not parse manifest (./sm.json).",
};*/

export function retrieveManifest(cwd: string): FileContent<Manifest> {
  const manifestPath = SMConfigPath(cwd)

  if (!Files.exists(manifestPath)) {
    return {
      exists: false,
      content: null
    }
  }

  const content: Manifest | null = Files.safeReadJson(manifestPath) as Manifest | null
  return {
    exists: true,
    content
  }
}

export function patchManifest(cwd: string, data: Partial<Manifest>): boolean {
  const manifest: FileContent<Manifest> = retrieveManifest(cwd)
  if (!manifest.exists || !manifest.content) return false

  const updatedManifest = {
    ...manifest.content,
    ...data
  }

  Files.write(SMConfigPath(cwd), updatedManifest)
  return true
}

export function updateManifestSMVersion(cwd: string, version: string): boolean {
  const manifest: FileContent<Manifest> = retrieveManifest(cwd)
  if (manifest.content?._latest) return false // if _latest already exists, we should not update this version otherwise we'd break the migration system
  
  return patchManifest(cwd, { _latest: version })
}