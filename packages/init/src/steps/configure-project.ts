import type { Models } from "@slicemachine/core";
import { FrameworkResult } from "./detect-framework";

import {
  retrieveJsonPackage,
  patchJsonPackage,
  patchManifest,
  retrieveManifest,
  createManifest,
} from "@slicemachine/core/build/src/fs-utils";

import {
  Base,
  buildRepositoryEndpoint,
} from "@slicemachine/core/build/src/prismic";
import { spinner } from "@slicemachine/core/build/src/internals";
import {
  SCRIPT_NAME,
  SCRIPT_VALUE,
} from "@slicemachine/core/build/src/defaults";

export function addJsonPackageSmScript(cwd: string): boolean {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) return false;

  const { scripts = {} } = pkg.content;

  if (scripts[SCRIPT_NAME]) return false;

  return patchJsonPackage(cwd, {
    scripts: { ...scripts, [SCRIPT_NAME]: SCRIPT_VALUE },
  });
}

export function configureProject(
  cwd: string,
  base: Base,
  repository: string,
  framework: FrameworkResult
): void {
  const spin = spinner(
    `Configuring your ${framework.value} & Prismic project...`
  );
  spin.start();

  try {
    const manifest = retrieveManifest(cwd);

    const manifestUpdated: Models.Manifest = {
      ...(manifest.exists && manifest.content ? manifest.content : {}),
      apiEndpoint: buildRepositoryEndpoint(base, repository),
      libraries: ["@/slices"],
      ...(framework.manuallyAdded ? { framework: framework.value } : {}),
    };

    if (!manifest.exists) createManifest(cwd, manifestUpdated);
    else patchManifest(cwd, manifestUpdated);

    addJsonPackageSmScript(cwd);

    spin.succeed("Project configured! Ready to start");
  } catch {
    spin.fail("Failed to configure your Prismic Local Builder");
    process.exit(-1);
  }
}
