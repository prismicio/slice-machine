import { FileSystem, Utils } from "slicemachine-core";

export function addScriptToPkg(cwd: string): void {
  const success = FileSystem.addJsonPackageSmScript(cwd);
  if (!success) {
    return Utils.writeError(`Could not write file "${Utils.CONSTS.MANIFEST_FILE_NAME}"`);
  }
  Utils.writeCheck(`Created file "${Utils.CONSTS.MANIFEST_FILE_NAME}"`);
}