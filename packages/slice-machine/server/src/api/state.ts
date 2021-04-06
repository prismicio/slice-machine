import fetchLibs from './libraries'
import { getEnv } from '../../../lib/env'
import { warningStates, warningTwoLiners } from '../../../lib/consts'
import { fetchStorybookUrl } from './common/utils'
import Environment from '../../../lib/models/common/Environment'
import Warning from '../../../lib/models/common/Warning'
import ErrorWithStatus from '../../../lib/models/common/ErrorWithStatus'
import ServerError from '../../../lib/models/server/ServerError'
import Files from '../../../lib/utils/files'
import { Pkg } from '../../../lib/models/paths'

const hasStorybookScript = (cwd: string) => {
  const pathToManifest = Pkg(cwd)
  try {
    const manifest = Files.readJson(pathToManifest)
    return !!(manifest && manifest.scripts && manifest.scripts.storybook)
  } catch(e) {
    return false
  }
}

async function createWarnings(env: Environment, configErrors?: { [errorKey: string]: ServerError }, clientError?: ErrorWithStatus): Promise<ReadonlyArray<Warning>> {
  const hasScript = hasStorybookScript(env.cwd)
  let storybookIsRunning = await (async () => {
    try {
      await fetchStorybookUrl(env.userConfig.storybook)
      return true
    } catch(e) {
      return false
    }
  })()

  const storybook = (() => {
    if (!hasScript) {
      const notInstalled = (warningTwoLiners as any)[warningStates.STORYBOOK_NOT_INSTALLED]
      return {
        key: warningStates.STORYBOOK_NOT_INSTALLED,
        title: notInstalled[0],
        description: notInstalled[1]
      }
    }
    if (configErrors?.storybook) {
      const notInManifest = (warningTwoLiners as any)[warningStates.STORYBOOK_NOT_IN_MANIFEST]
      return {
        key: warningStates.STORYBOOK_NOT_IN_MANIFEST,
        title: notInManifest[0],
        description: notInManifest[1]
      }
    }

    if (!storybookIsRunning) {
      const notRunning = (warningTwoLiners as any)[warningStates.STORYBOOK_NOT_RUNNING]
      return {
        key: warningStates.STORYBOOK_NOT_RUNNING,
        title: notRunning[0],
        description: notRunning[1]
      }
    }
  })();

  const newVersion = env.updateAvailable && env.updateAvailable.next ? {
    key: warningStates.NEW_VERSION_AVAILABLE,
    value: env.updateAvailable
  } : undefined

  const connected = !env.prismicData?.auth ? {
    key: warningStates.NOT_CONNECTED
  } : undefined

  const client = clientError ? {
    key: warningStates.CLIENT_ERROR,
    title: `${warningStates.CLIENT_ERROR}:${clientError.reason.toUpperCase()}`
  } : undefined
  
  return [storybook, newVersion, connected, client].filter(Boolean) as ReadonlyArray<Warning>
}

export default async function handler() {

  const { env, errors: configErrors } = await getEnv()
  const { libraries, remoteSlices, clientError } = await fetchLibs(env)

  const warnings = await createWarnings(env, configErrors, clientError)
  return { libraries, remoteSlices, clientError, configErrors, env, warnings }
}