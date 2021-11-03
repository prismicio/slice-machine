import path from "path";
import { execCommand } from "../utils";
import { Utils, FileSystem } from "@slicemachine/core";

export async function installRequiredDependencies(
  cwd: string,
  framework: Utils.Framework.FrameworkEnum
): Promise<void> {
  const yarnLock = Utils.Files.exists(FileSystem.YarnLockPath(cwd));
  const installDevDependencyCommand = yarnLock
    ? "yarn add -D"
    : "npm install --save-dev";
  const installDependencyCommand = yarnLock ? "yarn add" : "npm install";

  const spinner = Utils.spinner("Downloading Prismic Visual Builder");
  spinner.start();

  const { stderr } = await execCommand(
    `${installDevDependencyCommand} ${Utils.CONSTS.SM_PACKAGE_NAME}`
  );

  switch (framework) {
    case Utils.Framework.FrameworkEnum.react:
    case Utils.Framework.FrameworkEnum.next:
      `${installDependencyCommand} ${Utils.CONSTS.PRISMIC_REACT_PACKAGE_NAME}`;
      break;
    case Utils.Framework.FrameworkEnum.svelte:
      `${installDependencyCommand} ${Utils.CONSTS.PRISMIC_DOM_PACKAGE_NAME}`;
      break;
  }

  const pathToPkg = path.join(
    FileSystem.PackagePaths(cwd).value(),
    Utils.CONSTS.SM_PACKAGE_NAME
  );
  const isPackageInstalled = Utils.Files.exists(pathToPkg);

  if (isPackageInstalled || !stderr.length) {
    spinner.succeed("The Prismic Visual Builder was installed successfully");
    return;
  }

  spinner.fail();
  Utils.writeWarning(
    `could not install ${Utils.CONSTS.SM_PACKAGE_NAME}. Please do it manually!`
  );
}
