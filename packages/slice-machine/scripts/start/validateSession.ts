import { Models, NodeUtils, Prismic } from "@slicemachine/core";
import preferWroomBase from "@lib/utils/preferWroomBase";

export function validateSession(cwd: string): Promise<Models.UserInfo | null> {
  const manifest = NodeUtils.retrieveManifest(cwd);
  const config = Prismic.PrismicSharedConfigManager.get();

  // should not happen, manifest has been validated before.
  if (!manifest.exists || !manifest.content) return Promise.resolve(null);

  const base = preferWroomBase(manifest.content.apiEndpoint);

  if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
  if (base != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

  return Prismic.Communication.validateSession(config.cookies, base).catch(
    () => null
  );
}
