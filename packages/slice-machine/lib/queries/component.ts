import path from 'path'
import { ComponentInfo, ComponentMetadata } from '../models/common/Component'
// @ts-ignore
import { pascalize } from '../utils/str'

import { getPathToScreenshot, getExternalPathToScreenshot } from './screenshot'
import { AsObject } from '@lib/models/common/Variation'
import Slice from '@lib/models/common/Slice'
import Files from '../utils/files'
import migrate from '../migrate'

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

function fromJsonFile(slicePath: string, filePath: string): { has: boolean, data: any } {
  const fullPath = path.join(slicePath, filePath)
  const hasFile = Files.exists(fullPath)
  return {
    has: hasFile,
    data: hasFile ? Files.readJson(fullPath) : {}
  }
}

/** returns fileName, extension and isDirectory from path to slice */
function getFileInfoFromPath(slicePath: string, componentName: string): { fileName?: string, extension?: string, isDirectory: boolean } {
  const isDirectory = Files.isDirectory(slicePath)
  if (!isDirectory) {
    return { ...splitExtension(slicePath), isDirectory: false }
  }

  const files = Files.readDirectory(slicePath)
  const match = matchPossiblePaths(files, componentName)
  if (match) {
    return { ...splitExtension(match), isDirectory: true };
  }
  throw new Error(`[slice-machine] Could not find module file for component "${componentName}" at path "${slicePath}"`)
}

export function getComponentInfo(slicePath: string, { cwd, baseUrl, from }: { cwd: string, baseUrl: string, from: string }): ComponentInfo | undefined {
  const sliceName = getComponentName(slicePath)

  if (!sliceName || !sliceName.length) {
    console.error(`[queries/component-info] Could not find slice name at path "${slicePath}". Skipping...`)
    return
  }
  
  
  const { fileName, extension, isDirectory } = (() => {
    try {
      return getFileInfoFromPath(slicePath, sliceName)
    } catch(e) {
      return { fileName: null, extension: null, isDirectory: false }
    }
  })();

  if(!fileName || !extension) return

  const sliceModel: { has: boolean, data: Slice<AsObject> } = fromJsonFile(slicePath, 'model.json')
  const { model: modelData, migrated } = migrate(sliceModel.data, { sliceName, from }, null, false)
  const model = { data: modelData }
  const previewUrls = (model.data.variations || [])
    .map((v: any) => {
      const activeScreenshot = migrated
        ? getExternalPathToScreenshot({ cwd, from, sliceName })
        : getPathToScreenshot({ cwd, from, sliceName, variationId: v.id })

      return activeScreenshot && activeScreenshot.path
      ? { [v.id]: {
          hasPreview: !!activeScreenshot,
          isCustomPreview: activeScreenshot.isCustom,
          url: activeScreenshot && activeScreenshot.path ? `${baseUrl}/api/__preview?q=${encodeURIComponent(activeScreenshot.path)}&uniq=${Math.random()}` : undefined
        }}
      : undefined
    })
    .reduce((acc: any, variationPreview: any) => {
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