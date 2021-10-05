import { FileSystem } from 'slicemachine-core';

import { writeError } from '../utils/index.js';

export function validatePkg(cwd: string): void {
  const jsonPackage = FileSystem.JsonPackage.retrieveJsonPackage(cwd);
  if (!jsonPackage.exists) {
    writeError(`package.json not found. Are you in the right folder?`);
    return process.exit(-1);
  }
  if (!jsonPackage.content) {
    writeError(`could not parse package.json.`);
    return process.exit(-1);
  }
}