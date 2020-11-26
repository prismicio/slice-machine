import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { parseDomain, fromUrl } from 'parse-domain'

import { getPrismicData } from '../auth'
import initClient from '../client'
import createComparator from './semver'

const cwd = process.env.CWD || path.resolve(process.env.TEST_PROJECT_PATH)

const compareNpmVersions = createComparator()

const validate = (config) => {
  const errors = {}
  if (!config.apiEndpoint) {
    errors.apiEndpoint = {
      message: 'Expects a property "apiEndpoint" which points to your Prismic api/v2 url',
      example: 'http://my-project.prismic.io/api/v2',
      run: 'npx prismic-cli sm --setup'
    }
  }
  try {
  } catch(e) {
    const parsedRepo = parseDomain(fromUrl(config.apiEndpoint))
    if (!parsedRepo || (!parsedRepo.labels && !parsedRepo.subDomains)) {
      errors.apiEndpoint = {
        message: `Could not parse domain of given apiEnpoint (value: "${config.apiEndpoint}")`,
        example: 'http://my-project.prismic.io/api/v2',
        do: 'Update "apiEndpoint" value to match your Prismic api/v2 endpoint'
      }
    }
  }
  return errors
}

const extractRepo = (parsedRepo) => {
  if (parsedRepo.labels) {
    return parsedRepo.labels[0]
  }
  if (parsedRepo.subDomains) {
    return parsedRepo.subDomains[0]
  }
}

const handleBranch = () => {
  return new Promise(resolve => {
    exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
      if (err) {
        console.log('[info] could not get git branch')
        resolve({ err })
      }
      resolve({ branch: stdout.trim() })
    })
  })
}

const createChromaticUrls = ({ branch, appId, err }) => {
  if (err || !branch || !appId) {
    return null
  }
  return {
    storybook: `https://${branch}--${appId}.chromatic.com`,
    library: `https://chromatic.com/library?appId=${appId}&branch=${branch}`
  }
}

export const getEnv = async () => {
  const userConfigTxt = fs.readFileSync(path.join(cwd, 'sm.json'), 'utf8')
  const userConfig = JSON.parse(userConfigTxt)
  const maybeErrors = validate(userConfig)
  const parsedRepo = parseDomain(fromUrl(userConfig.apiEndpoint))
  const repo = extractRepo(parsedRepo)
  const { auth, base, ...prismicData } = getPrismicData()

  const branchInfo = await handleBranch()
  const chromatic = createChromaticUrls({ ...branchInfo, appId: userConfig.chromaticAppId })

  const { updateAvailable, currentVersion } = await compareNpmVersions({ cwd })

  return {
    errors: maybeErrors,
    env: {
      cwd,
      ...userConfig,
      repo,
      auth,
      base,
      ...prismicData,
      chromatic,
      currentVersion,
      updateAvailable,
      client: initClient(base, repo, auth)
    }
  }
}
