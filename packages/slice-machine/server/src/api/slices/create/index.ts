declare var appRoot: string;

// @ts-ignore
import cpy from 'copy-template-dir'
import { promisify } from 'util'
import path from 'path'

import Slice from '../../../../../lib/models/common/Slice'
import { AsObject } from '../../../../../lib/models/common/Variation'
import Environment from '../../../../../lib/models/common/Environment'

import { getEnv } from '../../../../../lib/env'
import { snakelize } from '../../../../../lib/utils/str'
import Files from '../../../../../lib/utils/files'

import save from '../save'

import { paths } from '../../../../../lib/models/paths'

const copy = promisify(cpy)

const IndexFiles = {
  'none': null,
  'react': 'index.js',
  'next': 'index.js',
  'nuxt': 'index.js',
  'vue': 'index.vue',
  'vanillajs': 'index.js'
}

const fromTemplate = async (env: Environment, from: string, sliceName: string) => {
  const templatePath = path.join(appRoot, 'templates', 'slice', env.framework)
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
}

export default async function handler({ sliceName, from, values }: { sliceName: string, from: string, values?: { componentCode: string, model: Slice<AsObject>} }) {
  const { env } = await getEnv()

  const pathToModel = paths(env.cwd, '').library(from).slice(sliceName).model()

  if (!values) {
    const maybeError = await fromTemplate(env, from, sliceName)
    if (maybeError) {
      return maybeError
    }
  } else {
    const fileName = IndexFiles[env.framework] || 'index.js'
    const pathToIndexFile = path.join(paths(env.cwd, '').library(from).slice(sliceName).value(), fileName)
    
    Files.write(pathToModel, JSON.stringify(values.model, null, 2))
    Files.write(pathToIndexFile, values.componentCode)
  }

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