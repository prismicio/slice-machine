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


  const templatePath = path.join(appRoot, 'templates', 'slice', 'react')// env.framework)

  if (!Files.isDirectory(templatePath)) {
    const message = `[create] Framework "${env.framework}" is not supported. (${templatePath})`
    console.error(message)
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    }
  }

  try {
    await copy(
      templatePath,
      path.join(env.cwd, from, sliceName),
      {
        componentName: sliceName,
        componentId: snakelize(sliceName),
        variationId: 'default-slice'
      },
    )
  } catch(e) {
    const message = `[create] Could not copy template. Full error: ${e}`
    console.error(message)
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    }
  }

  const pathToModel = paths(env.cwd, '').library(from).slice(sliceName).model()

  if (Files.exists(pathToModel)) {
    const model = Files.readJson(pathToModel)
    const res = await save({ body: { sliceName, from, model, mockConfig: {} } })
    return {
      ...res,
      variationId: 'default-slice'
    }
  }

  const msg = `[create] Could not find file model.json. Exiting...`
  return { err: new Error(msg), status: 500, reason: msg }
}