import { Utils, FileSystem } from "@slicemachine/core";

export function displayFinalMessage(cwd: string): void {
  const yarnLock = Utils.Files.exists(FileSystem.YarnLockPath(cwd));
  const command = `${yarnLock ? "yarn" : "npm"} run ${
    Utils.CONSTS.SCRIPT_NAME
  }`;

  console.log(
    `${Utils.white("■")} Run ${Utils.purple(
      command
    )} to now launch Slice Machine`
  );
}
