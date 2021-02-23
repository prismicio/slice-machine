import fs from 'fs'
import path from 'path'
import uniqid from 'uniqid'

import { pascalize } from 'sm-commons/utils/str'

import { getPathToScreenshot } from './screenshot'

function getMeta(model) {
  return Object.entries(model).reduce((acc, [key, value]) => ({
    ...acc,
    ...(['id', 'description'].includes(key) ? ({ [key]: value }) : {})
  }), {})
}

/** take a path to slice and return its name  */
function getComponentName(slicePath) {
  const split = slicePath.split(path.sep);
  const pop = split.pop();
  if (pop.indexOf('index.') === 0) {
    return split.pop();
  }
  if (pop.indexOf(split[split.length - 1]) === 0) {
    return slicePath.pop();
  }
  return pop.split('.')[0];
}

/** naive method to validate that a folder contains a entry file */
function matchPossiblePaths(files, componentName) {
  const possiblePaths = ['index', componentName]
    .reduce((acc, f) => [...acc, `${f}.vue`, `${f}.js`, `${f}.jsx`, `${f}.ts`, `${f}.tsx`], [])
  return files.find(e => possiblePaths.indexOf(e) > -1)
}

function splitExtension(str) {
  const fullName = str.split('/').pop()
  const [fileName, extension] = fullName.split('.')
  return {
    fileName,
    extension,
  }
}

function has(fullPath) {
  return fs.existsSync(fullPath)
}

function fromJsonFile(slicePath, filePath, key) {
  const fullPath = path.join(slicePath, filePath)
  const hasFile = has(fullPath)
  return {
    [`has${key[0].toUpperCase()}${key.slice(1)}`]: hasFile,
    [key]: hasFile ? JSON.parse(fs.readFileSync(fullPath, 'utf-8')) : {}
  }
}

/** returns fileName, extension and isDirectory from path to slice */
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
  throw new Error(`[slice-machine] Could not find module file for component "${componentName}" at path "${slicePath}"`)
}

export function getComponentInfo(slicePath, { cwd, from }) {
  const sliceName = getComponentName(slicePath)
  if (!sliceName || !sliceName.length) {
    return null
  }
  const { fileName, extension, isDirectory } = getFileInfoFromPath(slicePath, sliceName)
  const { model, ...otherModelValues } =  fromJsonFile(slicePath, 'model.json', 'model')

  const { path: pathToScreenshotFile, defaultPath, isCustom: isCustomPreview } = getPathToScreenshot({ cwd, from, sliceName })
  const hasPreview = !!pathToScreenshotFile

  const nameConflict =
    sliceName !== pascalize(model.id)
    ? { sliceName, id: model.id }
    : null

  return {
    sliceName,
    fileName,
    isDirectory,
    extension,
    model,
    ...getMeta(model),
    ...otherModelValues, // { hasModel }
    ...fromJsonFile(slicePath, 'mock.json', 'mock'),
    nameConflict,
    isCustomPreview,
    hasPreview,
    previewUrl: hasPreview ? `/api/__preview?q=${encodeURIComponent(pathToScreenshotFile || defaultPath)}` : null
  }
}