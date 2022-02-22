import path from "path";
import { execCommand } from "../utils";
import { Utils, FileSystem, Models } from "@slicemachine/core";

const {
  PRISMIC_CLIENT,
  PRISMIC_DOM_PACKAGE_NAME,
  PRISMIC_REACT_PACKAGE_NAME,
  SM_PACKAGE_NAME,
  NUXT_PRISMIC,
  NUXT_SM,
  VUE_SLICEZONE,
  PRISMIC_VUE,
  SLICE_SIMULATOR_REACT,
  SLICE_SIMULATOR_VUE,
  PRISMIC_HELPERS,
} = Utils.CONSTS;

function depsForFramework(framework: Models.Frameworks): string {
  switch (framework) {
    case Models.Frameworks.react:
      return `${PRISMIC_REACT_PACKAGE_NAME} ${PRISMIC_CLIENT} ${PRISMIC_HELPERS}`;
    case Models.Frameworks.next:
      return `${PRISMIC_REACT_PACKAGE_NAME} ${PRISMIC_CLIENT} ${SLICE_SIMULATOR_REACT} ${PRISMIC_HELPERS}`;
    case Models.Frameworks.svelte:
      return `${PRISMIC_DOM_PACKAGE_NAME} ${PRISMIC_CLIENT}`;
    case Models.Frameworks.nuxt:
      return `${NUXT_PRISMIC} ${NUXT_SM} ${VUE_SLICEZONE} ${SLICE_SIMULATOR_VUE}`;
    case Models.Frameworks.vue:
      return `${PRISMIC_VUE} ${PRISMIC_CLIENT}@v5.1.1 ${PRISMIC_DOM_PACKAGE_NAME} ${VUE_SLICEZONE}`;
    default:
      return "";
  }
}

export async function installRequiredDependencies(
  cwd: string,
  framework: Models.Frameworks
): Promise<void> {
  const yarnLock = Utils.Files.exists(FileSystem.YarnLockPath(cwd));
  const installDevDependencyCommand = yarnLock
    ? "yarn add -D"
    : "npm install --save-dev";
  const installDependencyCommand = yarnLock ? "yarn add" : "npm install --save";

  const spinner = Utils.spinner("Downloading Slice Machine");
  spinner.start();

  const { stderr } = await execCommand(
    `${installDevDependencyCommand} ${SM_PACKAGE_NAME}`
  );

  const deps = depsForFramework(framework);
  if (deps) await execCommand(`${installDependencyCommand} ${deps}`);

  const pathToPkg = path.join(
    FileSystem.PackagePaths(cwd).value(),
    SM_PACKAGE_NAME
  );
  const isPackageInstalled = Utils.Files.exists(pathToPkg);

  if (isPackageInstalled || !stderr.length) {
    spinner.succeed("Slice Machine was installed successfully");
    return;
  }

  spinner.fail();
  Utils.writeWarning(
    `could not install ${SM_PACKAGE_NAME}. Please do it manually!`
  );
}
