import { CONSTS, NodeUtils } from "@slicemachine/core";

export function displayFinalMessage(cwd: string): void {
  const yarnLock = NodeUtils.Files.exists(NodeUtils.YarnLockPath(cwd));
  const command = `${yarnLock ? "yarn" : "npm"} run ${CONSTS.SCRIPT_NAME}`;

  console.log(
    `${NodeUtils.logs.white("■")} Run ${NodeUtils.logs.purple(
      command
    )} to now launch Slice Machine`
  );
}
