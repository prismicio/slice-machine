import fs from 'fs'
import path from 'path'
import slash from 'slash'

import { getInfoFromPath as getLibraryInfo } from 'sm-commons/methods/lib'
import { getComponentInfo } from './component'
import getConfig from "next/config";

async function handleLibraryPath(libPath) {
  const { publicRuntimeConfig: config } = getConfig();
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
      if (!componentInfo) {
        return acc
      }
      return [
        ...acc,
        {
          from,
          pathToSlice,
          ...componentInfo
        }
      ]
    }, []
  );
  return [from, allComponents]
}

export async function listComponentsByLibrary(libraries) {
  const registries = await Promise.all(libraries.map(async lib => await handleLibraryPath(lib)))
  return registries
}
