import { Models } from "@slicemachine/core";
import preferWroomBase from "@lib/utils/preferWroomBase";
import {
  Communication,
  PrismicSharedConfigManager,
} from "@slicemachine/core/build/prismic";
import { retrieveManifest } from "@slicemachine/core/build/node-utils";

export function validateSession(cwd: string): Promise<Models.UserInfo | null> {
  const manifest = retrieveManifest(cwd);
  const config = PrismicSharedConfigManager.get();

  // should not happen, manifest has been validated before.
  if (!manifest.exists || !manifest.content) return Promise.resolve(null);

  const base = preferWroomBase(manifest.content.apiEndpoint);

  if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
  if (base != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

  return Communication.validateSession(config.cookies, base).catch(() => null);
}
