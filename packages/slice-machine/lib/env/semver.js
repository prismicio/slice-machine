import semver from 'semver'
import Files from '../utils/files'
import {
  YarnLock
} from '../models/paths'

const MessageByManager = {
  YARN: (name) => `yarn add -D ${name}`,
  NPM: (name) => `npm i --save-dev ${name}`
}

const createMessage = (name, cwd) =>
  Files.exists(YarnLock(cwd)) ?
    MessageByManager.YARN(name) :
    MessageByManager.NPM(name)

async function fetchJsonPackage(packageName) {
  try {
    const response = await fetch(`https://unpkg.com/${packageName}/package.json`);
    if (response.status !== 200) {
      throw new Error(`[scripts/bundle] Unable to fetch JSON package for package "${packageName}"`);
    }
    return await response.json();
  } catch (e) {
    return e
  }
}


const compare = (manifest, onlinePackage, { cwd }) => {
  if (!(onlinePackage instanceof Error)) {
    const lt = semver.lt(manifest.version, onlinePackage.version)
    if (lt) {
      return {
        current: manifest.version,
        next: onlinePackage.version,
        message: createMessage(manifest.name, cwd)
      }
    }
    return null
  }
  return {
    err: onlinePackage
  }
}

export default function createComparator() {
  let comparison
  return async ({ cwd }) => {
    if (comparison !== undefined) {
      return comparison
    }
    const manifest = (() => {
      try {
        const pathToManifest = './package.json'
        if (Files.exists(pathToManifest)) {
          return Files.readJson(pathToManifest)
        }
      } catch (e) {
        console.error(e)
        return null
      }
    })()
    if (!manifest) {
      comparison = {
        err: new Error('Could not parse package version')
      }
      return comparison
    }

    const onlinePackage = await fetchJsonPackage(manifest.name)
    const updateAvailable = compare(manifest, onlinePackage, {
      cwd
    })

    comparison = {
      currentVersion: manifest.version,
      onlinePackage,
      updateAvailable,
    }
    return comparison
  }
}
