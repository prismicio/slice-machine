import fs from 'fs'
import path from 'path'
import slash from 'slash'

import migrate from '../migrate'
import { getInfoFromPath as getLibraryInfo } from 'sm-commons/methods/lib'
import { getComponentInfo } from './component'

async function handleLibraryPath(env, libPath) {
  const {
    isLocal,
    pathExists,
    pathToSlices,
  } = await getLibraryInfo(libPath, env.cwd)

  if (!isLocal) {
    return null
  }
  if (!pathExists) {
    console.warn(`Path to library "${pathToSlices}" does not exist. Skipping.`)
    return null
  }

  // library identifier
  const from = isLocal ? libPath.slice(2) : libPath

  // all paths to components found in slices folder
  const pathsToComponents = fs.readdirSync(slash(pathToSlices))
    .map(curr => path.join(pathToSlices, curr))
    .filter(e => e.split(path.sep).pop() !== 'index.js')

  // relative path to slice folder, to be appended with sliceName
  const pathToSlice = `${isLocal ? './' : ''}${from}${pathToSlices.split(from).slice(1).join('')}`

  const allComponents = pathsToComponents.reduce(
    (acc, curr) => {
      const componentInfo = getComponentInfo(curr)
      if (!componentInfo) {
        return acc
      }
      const { model: maybeSliceModel } = componentInfo
      const { model, migrated } = migrate(maybeSliceModel, { ...componentInfo, from }, env)
      return [
        ...acc,
        {
          from,
          href: from.replace(/\//g, "--"),
          pathToSlice,
          ...componentInfo,
          model,
          migrated
        }
      ]
    }, []
  );
  return [from, allComponents]
}

export async function listComponentsByLibrary(env) {
  const payload = await Promise.all((env.libraries || []).map(async lib => await handleLibraryPath(env, lib)))
  return payload.filter(e => e)
}
