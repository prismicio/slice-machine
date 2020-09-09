import fs from 'fs'
import path from 'path'
import slash from 'slash'

import migrate from '../migrate'
import { getInfoFromPath as getLibraryInfo } from 'sm-commons/methods/lib'
import { getComponentInfo } from './component'
import getConfig from 'next/config'

const { publicRuntimeConfig: config } = getConfig()

async function handleLibraryPath(libPath) {
  const {
    isLocal,
    pathExists,
    pathToSlices,
  } = await getLibraryInfo(libPath, config.cwd)

  if (!pathExists) {
    console.warn(`[next-slicezone] path to library "${pathToSlices}" does not exist. Skipping.`)
    return {}
  }

  // library identifier
  const from = isLocal ? libPath.slice(2) : libPath

  // all paths to components found in slices folder
  const pathsToComponents = fs.readdirSync(slash(pathToSlices))
    .map(curr => path.join(pathToSlices, curr))
    .filter(e => e.split('/').pop() !== 'index.js')

  // relative path to slice folder, to be appended with sliceName
  const pathToSlice = `${isLocal ? './' : ''}${from}${pathToSlices.split(from).slice(1).join('')}`

  const allComponents = pathsToComponents.reduce(
    (acc, curr) => {
      const componentInfo = getComponentInfo(curr)
      const { model: maybeSliceModel } = componentInfo
      const { model, migrated } = migrate(maybeSliceModel, componentInfo)
      if (!componentInfo) {
        console.error('!component: ', curr)
        return acc
      }
      return [
        ...acc,
        {
          from,
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

export async function listComponentsByLibrary(libraries) {
  return await Promise.all(libraries.map(async lib => await handleLibraryPath(lib)))
}
