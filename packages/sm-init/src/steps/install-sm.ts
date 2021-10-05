import util from 'util'
import { exec } from 'child_process'
import { Utils, FileSystem } from 'slicemachine-core'

import { InitOperation, InitOperationStatus } from '../types/init.js'

const execPromise = util.promisify(exec)

export async function installSm(cwd: string): Promise<InitOperation> {
  const yarnLock = Utils.Files.exists(FileSystem.Paths.YarnLock(cwd))
  const command = yarnLock ? 'yarn add -D' : 'npm install --save-dev'

  const { stdout, stderr } = await execPromise(`${command} ${Utils.CONSTS.SM_PACKAGE_NAME}`);
  if (stderr.length) {
    return {
      status: InitOperationStatus.FAILURE,
      content: stderr
    }
  }

  return {
    status: InitOperationStatus.SUCCESS,
    content: stdout
  }
}
