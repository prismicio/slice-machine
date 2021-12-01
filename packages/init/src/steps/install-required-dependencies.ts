import path from "path";
import { execCommand } from "../utils";
import { Utils, FileSystem } from "@slicemachine/core";

function depsForFramework(framework: Utils.Framework.FrameworkEnum): string {
  const packages = [];

  if (
    framework === Utils.Framework.FrameworkEnum.react ||
    framework === Utils.Framework.FrameworkEnum.next
  ) {
    packages.push(Utils.CONSTS.PRISMIC_REACT_PACKAGE_NAME, "@prismicio/client");
  }

  if (framework === Utils.Framework.FrameworkEnum.next) {
    packages.push("next-slicezone");
  }

  if (framework === Utils.Framework.FrameworkEnum.svelte) {
    packages.push(Utils.CONSTS.PRISMIC_DOM_PACKAGE_NAME, "@prismicio/client");
  }

  return packages.join(" ");
}

export async function installRequiredDependencies(
  cwd: string,
  framework: Utils.Framework.FrameworkEnum
): Promise<void> {
  const yarnLock = Utils.Files.exists(FileSystem.YarnLockPath(cwd));
  const installDevDependencyCommand = yarnLock
    ? "yarn add -D"
    : "npm install --save-dev";
  const installDependencyCommand = yarnLock ? "yarn add" : "npm install --save";

  const spinner = Utils.spinner("Downloading Prismic Visual Builder");
  spinner.start();

  const { stderr } = await execCommand(
    `${installDevDependencyCommand} ${Utils.CONSTS.SM_PACKAGE_NAME}`
  );

  const deps = depsForFramework(framework);
  if (deps) await execCommand(`${installDependencyCommand} ${deps}`);

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
