declare var appRoot: string;

// @ts-ignore
import cpy from 'copy-template-dir'
import { promisify } from 'util'

import path from 'path'
import { getEnv } from '../../../../../lib/env'
import { snakelize } from '../../../../../lib/utils/str'
import Files from '../../../../../lib/utils/files'

import save from '../save'

import { paths } from '../../../../../lib/models/paths'

const copy = promisify(cpy)

export default async function handler({ sliceName, from }: { sliceName: string, from: string }) {
  const { env } = await getEnv()


  const templatePath = path.join(appRoot, 'templates', 'slice', env.framework)

  try {
    await copy(
      templatePath,
      path.join(env.cwd, from, sliceName),
      {
        componentName: sliceName,
        componentId: snakelize(sliceName),
      },
    )
  } catch(e) {
    return { error: e }
  }

  const pathToModel = paths(env.cwd, '').library(from).slice(sliceName).model()

  const model = Files.readJson(pathToModel)

  const res = await save({ body: { sliceName, from, model, mockConfig: {} } })

  return res
}