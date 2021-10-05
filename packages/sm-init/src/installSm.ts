import { exec } from 'child_process'
import util from 'util'
import { InitOperation, InitOperationStatus } from './initOperation'
import { Utils, FileSystem } from 'slicemachine-core'

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
