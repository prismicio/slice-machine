import path from "path";
import { execCommand, logs } from "../utils";
import { CONSTS, Models } from "@slicemachine/core";
import * as NodeUtils from "@slicemachine/core/build/node-utils";

const {
  PRISMIC_CLIENT,
  PRISMIC_DOM_PACKAGE_NAME,
  PRISMIC_REACT_PACKAGE_NAME,
  SM_PACKAGE_NAME,
  NUXT_PRISMIC,
  PRISMIC_VUE,
  SLICE_SIMULATOR_REACT,
  SLICE_SIMULATOR_VUE,
  PRISMIC_HELPERS,
  PRISMIC_TYPES,
} = CONSTS;

function depsForFramework(framework: Models.Frameworks): string {
  switch (framework) {
    case Models.Frameworks.react:
      return `${PRISMIC_REACT_PACKAGE_NAME} ${PRISMIC_CLIENT} ${PRISMIC_HELPERS}`;
    case Models.Frameworks.next:
      return `${PRISMIC_REACT_PACKAGE_NAME} ${PRISMIC_CLIENT} ${SLICE_SIMULATOR_REACT} ${PRISMIC_HELPERS}`;
    case Models.Frameworks.svelte:
      return `${PRISMIC_DOM_PACKAGE_NAME} ${PRISMIC_CLIENT}`;
    case Models.Frameworks.nuxt:
      return `${NUXT_PRISMIC} ${SLICE_SIMULATOR_VUE}`;
    case Models.Frameworks.vue:
      return `${PRISMIC_VUE} ${PRISMIC_CLIENT} ${PRISMIC_DOM_PACKAGE_NAME}`;
    default:
      return "";
  }
}

async function addAndInstallDeps(
  framework: Models.Frameworks,
  useYarn = false
): Promise<string> {
  const installDevDependencyCommand = useYarn
    ? "yarn add -D"
    : "npm install --save-dev";
  const installDependencyCommand = useYarn ? "yarn add" : "npm install --save";

  const { stderr } = await execCommand(
    `${installDevDependencyCommand} ${SM_PACKAGE_NAME} ${PRISMIC_TYPES}`
  );

  const deps = depsForFramework(framework);
  if (deps) await execCommand(`${installDependencyCommand} ${deps}`);

  return stderr;
}

async function installDeps(useYarn = false): Promise<string> {
  const installCommand = useYarn ? "yarn" : "npm install";
  const { stderr } = await execCommand(installCommand);
  return stderr;
}

export async function installRequiredDependencies(
  cwd: string,
  framework: Models.Frameworks,
  skipDependencies: boolean
): Promise<void> {
  const yarnLock = NodeUtils.Files.exists(NodeUtils.YarnLockPath(cwd));

  const spinner = logs.spinner("Installing Slice Machine");
  spinner.start();

  const stderr = await (skipDependencies
    ? installDeps(yarnLock)
    : addAndInstallDeps(framework, yarnLock));

  const pathToPkg = path.join(
    NodeUtils.PackagePaths(cwd).value(),
    SM_PACKAGE_NAME
  );
  const isPackageInstalled = NodeUtils.Files.exists(pathToPkg);

  if (isPackageInstalled || !stderr.length) {
    spinner.succeed("Slice Machine was installed successfully");
    return;
  }

  spinner.fail();
  logs.writeWarning(
    `could not install ${SM_PACKAGE_NAME}. Please do it manually!`
  );
}
