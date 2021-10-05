import { FileSystem, Utils } from "slicemachine-core";
import { writeError, writeCheck } from "../utils/index.js";

export function addScriptToPkg(cwd: string): void {
  const success = FileSystem.JsonPackage.addSmScript(cwd);
  if (!success) {
    return writeError(`Could not write file "${Utils.CONSTS.MANIFEST_FILE_NAME}"`);
  }
  writeCheck(`Created file "${Utils.CONSTS.MANIFEST_FILE_NAME}"`);
}