import { FileSystem } from 'slicemachine-core';
import { writeError } from 'slicemachine-core/utils';

export function validatePkg(cwd: string): void {
  const jsonPackage = FileSystem.retrieveJsonPackage(cwd);
  if (!jsonPackage.exists) {
    writeError(`package.json not found. Are you in the right folder?`);
    return process.exit(-1);
  }
  if (!jsonPackage.content) {
    writeError(`could not parse package.json.`);
    return process.exit(-1);
  }
}