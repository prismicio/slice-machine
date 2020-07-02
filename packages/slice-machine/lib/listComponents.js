import fs from 'fs'
import path from 'path'
import slash from 'slash'

import { getInfoFromPath as getLibraryInfo } from 'sm-commons/methods/lib'
import getConfig from "next/config";

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
      const { name: sliceName, fileName, extension, isDirectory } = getComponentInfo(curr)
      return [
        ...acc,
        {
          sliceName,
          from,
          pathToSlice,
          extension,
          fileName,
          isDirectory
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
