import { Utils, CONSTS, NodeUtils } from "@slicemachine/core";

export function displayFinalMessage(cwd: string): void {
  const yarnLock = Utils.Files.exists(NodeUtils.YarnLockPath(cwd));
  const command = `${yarnLock ? "yarn" : "npm"} run ${CONSTS.SCRIPT_NAME}`;

  console.log(
    `${Utils.white("■")} Run ${Utils.purple(
      command
    )} to now launch Slice Machine`
  );
}
