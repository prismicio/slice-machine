import * as NodeUtils from "@prismic-beta/slicemachine-core/build/node-utils";
import { logs } from "../utils";

export function validatePkg(cwd: string): void {
  const jsonPackage = NodeUtils.retrieveJsonPackage(cwd);
  if (!jsonPackage.exists) {
    logs.writeError(`package.json not found. Are you in the right folder?`);
    return process.exit(-1);
  }
  if (!jsonPackage.content) {
    logs.writeError(`could not parse package.json.`);
    return process.exit(-1);
  }
}
