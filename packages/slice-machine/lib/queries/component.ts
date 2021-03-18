import fs from 'fs'
import path from 'path'
import { ComponentInfo, ComponentMetadata } from '../models/common/Component'
import { pascalize } from 'sm-commons/utils/str'

import { getPathToScreenshot } from './screenshot'
import { AsObject } from '../../lib/models/common/Variation'
import { Slice } from '../../lib/models/common/Slice'

function getMeta(modelData: any): ComponentMetadata {
  return {
    id: modelData.id,
    description: modelData.description
  }
}

/** take a path to slice and return its name  */
/* TODO: REFACTOR! so error prone to pop everywhere */
function getComponentName(slicePath: string): string | undefined {
  const split = slicePath.split(path.sep);
  const pop = split.pop();
  if(!pop) return

  if (pop.indexOf('index.') === 0) {
    return split.pop();
  }
  if (pop.indexOf(split[split.length - 1]) === 0) {
    return slicePath.split(path.sep).pop();
  }
  return pop.split('.')[0];
}

/** naive method to validate that a folder contains a entry file */
function matchPossiblePaths(files: ReadonlyArray<string>, componentName: string): string | undefined {
  const possiblePaths = ['index', componentName]
    .reduce((acc: string[], f: string) => [...acc, `${f}.vue`, `${f}.js`, `${f}.jsx`, `${f}.ts`, `${f}.tsx`], [])
  return files.find(e => possiblePaths.indexOf(e) > -1)
}

function splitExtension(str: string): { fileName: string, extension: string } | undefined {
  const fullName = str.split('/').pop()
  if(!fullName) return

  const [fileName, extension] = fullName.split('.')
  return {
    fileName,
    extension,
  }
}

function has(fullPath: string): boolean {
  return fs.existsSync(fullPath)
}

function fromJsonFile(slicePath: string, filePath: string): { has: boolean, data: any } {
  const fullPath = path.join(slicePath, filePath)
  const hasFile = has(fullPath)
  return {
    has: hasFile,
    data: hasFile ? JSON.parse(fs.readFileSync(fullPath, 'utf-8')) : {}
  }
}

/** returns fileName, extension and isDirectory from path to slice */
function getFileInfoFromPath(slicePath: string, componentName: string): { fileName?: string, extension?: string, isDirectory: boolean } {
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

export function getComponentInfo(slicePath: string, { cwd, baseUrl, from }: { cwd: string, baseUrl: string, from: string }): ComponentInfo | undefined {
  const sliceName = getComponentName(slicePath)
  if (!sliceName || !sliceName.length) {
    return
  }
  
  const { fileName, extension, isDirectory } = getFileInfoFromPath(slicePath, sliceName)
  if(!fileName || !extension) return

  const model: { has: boolean, data: Slice<AsObject> } = fromJsonFile(slicePath, 'model.json')
  const previewUrls = model.data.variations
    .map(v => {
      const { path: pathToScreenshotFile, isCustom: isCustomPreview } = getPathToScreenshot({ cwd, from, sliceName, variationName: v.id })
      const hasPreview = !!pathToScreenshotFile
      return hasPreview && pathToScreenshotFile
      ? { [v.id]: {
          hasPreview,
          isCustomPreview,
          url: hasPreview && pathToScreenshotFile ? `${baseUrl}/api/__preview?q=${encodeURIComponent(pathToScreenshotFile)}&uniq=${Math.random()}` : undefined
        }}
      : undefined
    })
    .reduce((acc, variationPreview) => {
      return { ...acc, ...variationPreview }
    }, {})

  const nameConflict = sliceName !== pascalize(model.data.id)
    ? { sliceName, id: model.data.id }
    : undefined

  return {
    sliceName,
    fileName,
    isDirectory,
    extension,
    model: model.data,
    meta: getMeta(model.data),
    mock: fromJsonFile(slicePath, 'mock.json').data,
    nameConflict,
    previewUrls
  }
}