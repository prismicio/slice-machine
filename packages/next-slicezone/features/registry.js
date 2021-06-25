import fs from 'fs'
import path from 'path'
import slash from 'slash'

import { SM_FILE } from 'sm-commons/consts'
import { getInfoFromPath as getLibraryInfo } from '../helper'
import { create as createFile } from './resolver';

function getComponentName(slicePath) {
  const split = slicePath.split('/');
  const pop = split.pop();
  if (pop.indexOf('index.') === 0) {
    return split.pop();
  }
  if (pop.indexOf(split[split.length - 1]) === 0) {
    return slicePath.pop();
  }
  return pop.split('.')[0];
}

function matchPossiblePaths(files, componentName) {
  const possiblePaths = ['index', componentName]
    .reduce((acc, f) => [...acc, `${f}.vue`, `${f}.js`, `${f}.jsx`, `${f}.ts`, `${f}.tsx`], [])
  return files.find(e => possiblePaths.indexOf(e) > -1)
}

function getFileInfoFromPath(slicePath, componentName) {
  const isDirectory = fs.lstatSync(slicePath).isDirectory()
  if (!isDirectory) {
    return { ...splitExtension(slicePath), isDirectory: false }
  }

  const files = fs.readdirSync(slicePath)
  const match = matchPossiblePaths(files, componentName)
  if (match) {
    return { ...splitExtension(match), isDirectory: true };
  }
  throw new Error(`[nuxt-sm] Could not find module file for component "${componentName}" at path "${slicePath}"`)
}

function getComponentInfo(slicePath) {
  const name = getComponentName(slicePath)
  const { fileName, extension, isDirectory } = getFileInfoFromPath(slicePath, name)
  return {
    name,
    fileName,
    isDirectory,
    extension
  }

}

function splitExtension(str) {
  const fullName = str.split('/').pop()
  const [fileName, extension] = fullName.split('.')
  return {
    fileName,
    extension,
  }
}

async function handleLibraryPath(libPath) {
  const {
    isLocal,
    pathExists,
    pathToSlices,
  } = await getLibraryInfo(libPath)

  if (!pathExists) {
    console.warn(`[next-slicezone] path to library "${pathToSlices}" does not exist. Skipping.`)
    return {}
  }

  // all paths to components found in slices folder
  const pathsToComponents = fs.readdirSync(slash(pathToSlices))
    .map(curr => path.join(pathToSlices, curr))
    .filter(e => e.split('/').pop() !== 'index.js')

  // library identifier
  const from = isLocal ? libPath.slice(2) : libPath

  // relative path to slice folder, to be appended with sliceName
  const pathToSlice = `${isLocal ? './' : ''}${from}${pathToSlices.split(from).slice(1).join('')}`

  return pathsToComponents.reduce(
    (acc, curr) => {
      const { name: sliceName, fileName, extension, isDirectory } = getComponentInfo(curr)
      return {
        ...acc,
        [sliceName]: {
          from,
          sliceName,
          pathToSlice,
          extension,
          fileName,
          isDirectory
        }
      }
    }, {}
  );
}

export async function registry(writeFile = false) {
  const pathToSmFile = path.posix.join(process.cwd(), SM_FILE)
  const { libraries } = fs.existsSync(pathToSmFile) ? JSON.parse(fs.readFileSync(pathToSmFile)) : {}

  if (!libraries) {
    return console.warn('[next-slicezone] expects a non-empty "libraries" array. If it was intended, consider removing the plugin from your config')
  }

  if (!Array.isArray(libraries) || !libraries.length) {
    return console.error('[next-slicezone] expects "libraries" option to be a non-empty array')
  }

  const registries = await Promise.all(libraries.map(async lib => await handleLibraryPath(lib)))
  const registry = registries.reduce((acc, curr) => ({ ...curr, ...acc }), {})
  if (writeFile) {
    createFile(registry)
  }
  return registry
}