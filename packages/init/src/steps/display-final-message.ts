import { CONSTS } from "@prismic-beta/slicemachine-core";
import * as NodeUtils from "@prismic-beta/slicemachine-core/build/node-utils";
import { logs } from "../utils";

export function displayFinalMessage(
  cwd: string,
  wasStarter: boolean,
  reponame: string,
  base: string
): void {
  const yarnLock = NodeUtils.Files.exists(NodeUtils.YarnLockPath(cwd));
  const command = `${yarnLock ? "yarn" : "npm"} run ${CONSTS.SCRIPT_NAME}`;
  console.log();

  if (wasStarter) {
    const repoUrl = new URL(base);
    repoUrl.hostname = `${reponame}.${repoUrl.hostname}`;
    const urlAsString = repoUrl.toString();

    const message = `${logs.white(
      "■"
    )} Start editing your content in Prismic ${logs.purple(urlAsString)}`;
    console.log(message);
  } else {
    console.log(
      `${logs.white("■")} Run ${logs.purple(
        command
      )} to launch Slice Machine and create your first Custom Type`
    );
  }
}
