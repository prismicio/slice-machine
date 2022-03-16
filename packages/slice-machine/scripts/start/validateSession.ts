import { Auth, Models, NodeUtils } from "@slicemachine/core";
import preferWroomBase from "@lib/utils/preferWroomBase";

export function validateSession(cwd: string): Promise<Models.UserInfo | null> {
  const manifest = NodeUtils.retrieveManifest(cwd);

  // should not happen, manifest has been validated before.
  if (!manifest.exists || !manifest.content) return Promise.resolve(null);

  const base = preferWroomBase(manifest.content.apiEndpoint);
  return Auth.validateSession(base);
}
