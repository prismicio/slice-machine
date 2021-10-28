import { FileSystem, Utils } from "@slicemachine/core";

export function validatePkg(cwd: string): void {
  const jsonPackage = FileSystem.retrieveJsonPackage(cwd);
  if (!jsonPackage.exists) {
    Utils.writeError(`package.json not found. Are you in the right folder?`);
    return process.exit(-1);
  }
  if (!jsonPackage.content) {
    Utils.writeError(`could not parse package.json.`);
    return process.exit(-1);
  }
}
