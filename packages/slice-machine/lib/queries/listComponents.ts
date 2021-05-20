import path from 'path'
import slash from 'slash'

import Files from '../utils/files'
import migrate from '../migrate'
import { getInfoFromPath } from '../utils/lib'
import { getComponentInfo } from './component'
import Environment from '../models/common/Environment'
import { Component } from '../models/common/Component'
import { Library } from '../models/common/Library'

async function handleLibraryPath(env: Environment, libPath: string): Promise<Library | undefined> {
  const {
    isLocal,
    pathExists,
    pathToSlices,
  } = getInfoFromPath(libPath, env.cwd)

  // if (!isLocal) {
  //   return
  // }
  if (!pathExists) {
    console.warn(`Path to library "${pathToSlices}" does not exist. Skipping.`)
    return
  }

  // library identifier
  const from = isLocal ? libPath.slice(2) : libPath

  // all paths to components found in slices folder
  const pathsToComponents = Files.readDirectory(slash(pathToSlices))
    .map(curr => path.join(pathToSlices, curr))
    .filter(e => {
      const f = e.split(path.sep).pop()
      return f !== 'index.js' && f?.[0] !== '.'
    })

  // relative path to slice folder, to be appended with sliceName
  const pathToSlice = `${isLocal ? './' : ''}${from}${pathToSlices.split(from).slice(1).join('')}`

  const allComponents: Component[] = pathsToComponents.reduce(
    (acc: Component[], curr: string) => {
      const componentInfo = getComponentInfo(curr, { ...env, from })
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
          infos: componentInfo,
          model,
          migrated
        }
      ]
    }, []
  );
  return {
    isLocal,
    name: from,
    components: allComponents
  }
}


export async function listComponentsByLibrary(env: Environment): Promise<ReadonlyArray<Library>> {
  const payload = await Promise.all((env.userConfig.libraries || [])
   .map(async lib => await handleLibraryPath(env, lib)))
  
  return payload.filter(Boolean) as ReadonlyArray<Library>
}
