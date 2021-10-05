import path from 'path'
import util from 'util'
import ora from 'ora'
import { exec } from 'child_process'
import { Utils, FileSystem } from 'slicemachine-core'

import { InitOperation, InitOperationStatus } from '../types/init.js'
import { writeWarning } from '../utils/index.js'

const execPromise = util.promisify(exec)

export async function installSm(cwd: string): Promise<InitOperation> {
  const yarnLock = Utils.Files.exists(FileSystem.Paths.YarnLock(cwd));
  const command = yarnLock ? 'yarn add -D' : 'npm install --save-dev';

  const spinner = ora('Downloading Prismic Visual Builder');
  spinner.start();

  const { stderr, stdout } = await execPromise(`${command} ${Utils.CONSTS.SM_PACKAGE_NAME}`);

  const pathToPkg = path.join(FileSystem.Paths.PackagePaths(cwd).value(), Utils.CONSTS.SM_PACKAGE_NAME);
  const isPackageInstalled = Utils.Files.exists(pathToPkg);

  if (isPackageInstalled || !stderr.length) {
    spinner.succeed();
    return {
      status: InitOperationStatus.SUCCESS,
      content: stdout,
    }
  }

  spinner.fail();
  writeWarning(`could not install ${Utils.CONSTS.SM_PACKAGE_NAME}. Please do it manually!`);
  return {
    status: InitOperationStatus.FAILURE,
    content: stderr,
  }
}
