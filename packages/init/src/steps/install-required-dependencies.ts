import path from "path";
import { execCommand } from "../utils";

import { Models } from "@slicemachine/core";
import {
  Files,
  writeWarning,
  spinner,
} from "@slicemachine/core/build/src/internals";
import {
  YarnLockPath,
  PackagePaths,
} from "@slicemachine/core/build/src/fs-utils";

import {
  PRISMIC_CLIENT,
  PRISMIC_DOM_PACKAGE_NAME,
  PRISMIC_REACT_PACKAGE_NAME,
  NEXT_SLICEZONE,
  SM_PACKAGE_NAME,
  NUXT_PRISMIC,
  NUXT_SM,
  VUE_SLICEZONE,
  PRISMIC_VUE,
  SLICE_CANVAS_REACT,
  SLICE_CANVAS_VUE,
} from "@slicemachine/core/build/src/defaults";

function depsForFramework(framework: Models.Frameworks): string {
  switch (framework) {
    case Models.Frameworks.react:
      return `${PRISMIC_REACT_PACKAGE_NAME} ${PRISMIC_CLIENT}`;
    case Models.Frameworks.next:
      return `${PRISMIC_REACT_PACKAGE_NAME} ${PRISMIC_CLIENT} ${NEXT_SLICEZONE} ${SLICE_CANVAS_REACT}`;
    case Models.Frameworks.svelte:
      return `${PRISMIC_DOM_PACKAGE_NAME} ${PRISMIC_CLIENT}`;
    case Models.Frameworks.nuxt:
      return `${NUXT_PRISMIC} ${NUXT_SM} ${VUE_SLICEZONE} ${SLICE_CANVAS_VUE}`;
    case Models.Frameworks.vue:
      return `${PRISMIC_VUE} ${PRISMIC_CLIENT} ${PRISMIC_DOM_PACKAGE_NAME} ${VUE_SLICEZONE}`;
    default:
      return "";
  }
}

export async function installRequiredDependencies(
  cwd: string,
  framework: Models.Frameworks
): Promise<void> {
  const yarnLock = Files.exists(YarnLockPath(cwd));
  const installDevDependencyCommand = yarnLock
    ? "yarn add -D"
    : "npm install --save-dev";
  const installDependencyCommand = yarnLock ? "yarn add" : "npm install --save";

  const spin = spinner("Downloading Prismic Visual Builder");
  spin.start();

  const { stderr } = await execCommand(
    `${installDevDependencyCommand} ${SM_PACKAGE_NAME}`
  );

  const deps = depsForFramework(framework);
  if (deps) await execCommand(`${installDependencyCommand} ${deps}`);

  const pathToPkg = path.join(PackagePaths(cwd).value(), SM_PACKAGE_NAME);
  const isPackageInstalled = Files.exists(pathToPkg);

  if (isPackageInstalled || !stderr.length) {
    spin.succeed("The Prismic Visual Builder was installed successfully");
    return;
  }

  spin.fail();
  writeWarning(`could not install ${SM_PACKAGE_NAME}. Please do it manually!`);
}
