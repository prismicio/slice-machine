import { CONSTS, NodeUtils } from "@slicemachine/core";
import { logs } from "../utils";

export function displayFinalMessage(cwd: string): void {
  const yarnLock = NodeUtils.Files.exists(NodeUtils.YarnLockPath(cwd));
  const command = `${yarnLock ? "yarn" : "npm"} run ${CONSTS.SCRIPT_NAME}`;

  console.log(
    `${logs.white("■")} Run ${logs.purple(command)} to now launch Slice Machine`
  );
}
