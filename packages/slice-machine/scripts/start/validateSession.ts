import type { Models } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";
import { retrieveManifest } from "@slicemachine/core/build/node-utils";

import { Client } from "@slicemachine/client";

import preferWroomBase from "@lib/utils/preferWroomBase";
import { getApplicationMode } from "../../server/src/api/services/getEnv";

export function validateSession(
  cwd: string
): Promise<Models.UserProfile | null> {
  const manifest = retrieveManifest(cwd);
  const config = PrismicSharedConfigManager.get();

  // should not happen, manifest has been validated before.
  if (!manifest.exists || !manifest.content) return Promise.resolve(null);

  const base = preferWroomBase(manifest.content.apiEndpoint);

  if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
  if (base != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

  // not using the repository as we just wants the user profile here
  const client = new Client(
    getApplicationMode(manifest.content.apiEndpoint),
    null,
    PrismicSharedConfigManager.getAuth()
  );

  return client.profile().catch(() => null);
}
