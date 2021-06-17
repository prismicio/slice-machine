import path from 'path'
import { exec } from 'child_process'
import { parseDomain, fromUrl, ParseResultType, ParseResult } from 'parse-domain'

import { getPrismicData } from '../auth'
import initClient from "../models/common/http";
import createComparator from './semver'

import { getConfig as getMockConfig } from '../mock/misc/fs'

import Files from '../utils/files'
import { SMConfig } from '../models/paths'

import Environment from '../models/common/Environment'
import ServerError from '../models/server/ServerError'
import Chromatic from '../models/common/Chromatic'
import FakeClient from '../models/common/http/FakeClient'
import { detectFramework } from '../framework'
const cwd = process.env.CWD || path.resolve(process.env.TEST_PROJECT_PATH || '')

const compareNpmVersions = createComparator()

function validate(config: { apiEndpoint: string }): {[errorKey: string]: ServerError } | undefined {
  if (!config.apiEndpoint) {
    return { apiEndpoint: {
      message: 'Expects a property "apiEndpoint" which points to your Prismic api/v2 url',
      example: 'http://my-project.prismic.io/api/v2',
      run: 'npx prismic-cli sm --setup'
    }}
  }
  try {
  } catch(e) {
    const parsedRepo = parseDomain(fromUrl(config.apiEndpoint))
    switch (parsedRepo.type) {
      case ParseResultType.Listed: return

      default:
        return { apiEndpoint: {
          message: `Could not parse domain of given apiEnpoint (value: "${config.apiEndpoint}")`,
          example: 'http://my-project.prismic.io/api/v2',
          do: 'Update "apiEndpoint" value to match your Prismic api/v2 endpoint'
        }}
    }
  }
}

function extractRepo(parsedRepo: ParseResult): string | undefined {
  switch (parsedRepo.type) {
    case ParseResultType.Listed:
      if (parsedRepo.labels.length) {
        return parsedRepo.labels[0]
      }
      if (parsedRepo.subDomains.length) {
        return parsedRepo.subDomains[0]
      }
    default: return
  }
}

function handleBranch(): Promise<{ branch?: string, err?: Error }> {
  return new Promise(resolve => {
    exec('git rev-parse --abbrev-ref HEAD', (err, stdout) => {
      if (err) {
        resolve({ err })
      }
      resolve({ branch: stdout.trim() })
    })
  })
}

function createChromaticUrls({ branch, appId, err }: { branch?: string, appId?: string, err?: Error}): Chromatic | undefined {
  if (err || !branch || !appId) {
    return;
  }
  return {
    storybook: `https://${branch}--${appId}.chromatic.com`,
    library: `https://chromatic.com/library?appId=${appId}&branch=${branch}`
  }
}

function parseStorybookConfiguration(cwd: string) {
  const pathsToFile = [path.join(cwd, '.storybook/main.js'), path.join(cwd, 'nuxt.config.js')]
  const f = Files.readFirstOf(pathsToFile)(v => v)
  const file = f?.value as string || ''
  return file.includes('getStoriesPaths') || file.includes('.slicemachine')
}

export async function getEnv(): Promise<{ errors?: {[errorKey: string]: ServerError }, env: Environment }> {
  const userConfig = Files.readJson(SMConfig(cwd))
  const maybeErrors = validate(userConfig)
  const hasGeneratedStoriesPath = parseStorybookConfiguration(cwd)
  const parsedRepo = parseDomain(fromUrl(userConfig.apiEndpoint))
  const repo = extractRepo(parsedRepo)
  const prismicData = getPrismicData()

  const branchInfo = await handleBranch()
  const chromatic = createChromaticUrls({ ...branchInfo, appId: userConfig.chromaticAppId })

  const { updateAvailable, currentVersion } = await compareNpmVersions({ cwd })

  const mockConfig = getMockConfig(cwd)

  const client = (() => {
    if(prismicData.isOk()) {
      return initClient(cwd, prismicData.value.base, repo, prismicData.value.auth?.auth)
    } else {
      return new FakeClient()
    }
  })()

  return {
    errors: maybeErrors,
    env: {
      cwd,
      userConfig,
      repo,
      prismicData: prismicData.isOk() ? prismicData.value : undefined,
      chromatic,
      currentVersion,
      updateAvailable,
      mockConfig,
      hasGeneratedStoriesPath,
      framework: detectFramework(cwd),
      baseUrl: `http://localhost:${process.env.PORT}`,
      client
    }
  }
}
