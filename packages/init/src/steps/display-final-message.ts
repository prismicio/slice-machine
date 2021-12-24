import { YarnLockPath } from "@slicemachine/core/build/src/fs-utils";
import { Files } from "@slicemachine/core/build/src/internals";
import { SCRIPT_NAME } from "@slicemachine/core/build/src/defaults";
import { white, purple } from "@slicemachine/core/build/src/internals";

export function displayFinalMessage(cwd: string): void {
  const yarnLock = Files.exists(YarnLockPath(cwd));
  const command = `${yarnLock ? "yarn" : "npm"} run ${SCRIPT_NAME}`;

  console.log(
    `${white("■")} Run ${purple(command)} to now launch your Local Builder`
  );
}
