import { FileSystem, Auth, Models } from "@slicemachine/core";
import preferWroomBase from "@lib/utils/preferWroomBase";

export async function validateSession(
  cwd: string
): Promise<Models.UserInfo | null> {
  const manifest = FileSystem.retrieveManifest(cwd);

  // should not happen, manifest has been validated before.
  if (!manifest.exists || !manifest.content) return null;

  const base = preferWroomBase(manifest.content.apiEndpoint);
  return Auth.validateSession(base);
}
