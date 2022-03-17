import { NodeUtils } from "@slicemachine/core";

export function validatePkg(cwd: string): void {
  const jsonPackage = NodeUtils.retrieveJsonPackage(cwd);
  if (!jsonPackage.exists) {
    NodeUtils.logs.writeError(
      `package.json not found. Are you in the right folder?`
    );
    return process.exit(-1);
  }
  if (!jsonPackage.content) {
    NodeUtils.logs.writeError(`could not parse package.json.`);
    return process.exit(-1);
  }
}
