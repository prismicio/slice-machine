/* global variable define in server/src/index.js */
declare var appRoot: string;
import { CustomPaths, GeneratedPaths } from '../../../../lib/models/paths'
import Storybook from '../storybook'

import { getEnv } from '../../../../lib/env'
import mock from '../../../../lib/mock/Slice'
import { insert as insertMockConfig } from '../../../../lib/mock/misc/fs'
import Files from '../../../../lib/utils/files'
import { SliceMockConfig } from '../../../../lib/models/common/MockConfig'
import { Preview } from '../../../../lib/models/common/Component'
import Previews from '../previews';

 export default async function handler(req: { body: any }) {
    const { env } = await getEnv()
    const { sliceName, from, model, mockConfig } = req.body

    const pathToSliceAssets = GeneratedPaths(env.cwd).library(from).slice(sliceName).value()
    Files.flushDirectories(pathToSliceAssets)

    const updatedMockConfig = insertMockConfig(env.cwd, {
      key: sliceName,
      prefix: from,
      value: mockConfig
    })

    console.log('[slice/save]: updating slice model')

    const modelPath = CustomPaths(env.cwd)
      .library(from)
      .slice(sliceName)
      .model()
    
    Files.write(modelPath, model)
    
    const hasCustomMocks = Files.exists(
      CustomPaths(env.cwd)
      .library(from)
      .slice(sliceName)
      .mocks()
    )

    if(!hasCustomMocks) {
      console.log('[slice/save]: generating mocks')
    
      const mockedSlice = await mock(sliceName, model, SliceMockConfig.getSliceMockConfig(updatedMockConfig, from, sliceName))
      Files.write(
        GeneratedPaths(env.cwd)
          .library(from)
          .slice(sliceName)
          .mocks(),
        mockedSlice
      )
    }

    // const hasCustomStories = Files.exists(
    //   CustomPaths(env.cwd)
    //   .library(from)
    //   .slice(sliceName)
    //   .stories()
    // )

    console.log('[slice/save]: generating stories')
    Storybook.generateStories(appRoot, env.framework, env.cwd, from, sliceName)
    
    console.log('[slice/save]: generating screenshots previews')
    // since we iterate over variation and execute async code, we need a regular `for` loop to make sure that it's done sequentially and wait for the promise before running the next iteration
    // no, even foreach doesn't do the trick ;)

    let warning: string | null = null
    let previewUrls: { [variationId: string]: Preview } = {}

    const generatedPreviews = await Previews.generateForSlice(env, from, sliceName)

    const failedPreviewsIds = generatedPreviews.filter(p => !p.hasPreview).map(p => p.variationId)
    
    generatedPreviews.forEach(p => {
      if(!p.hasPreview) {
        const noPreview = p as { variationId: string, error: Error, hasPreview: boolean }
        warning = noPreview.error.message
        console.log(`[slice/save][Slice: ${sliceName}][variation: ${p.variationId}]: ${noPreview.error.message}`)
        previewUrls[noPreview.variationId] = {
          variationId: noPreview.variationId,
          isCustomPreview: false,
          hasPreview: false,
        }
      }
      
      const preview = p as Preview
      previewUrls[preview.variationId] = {
        variationId: preview.variationId,
        isCustomPreview: false,
        hasPreview: true,
        url: preview.url
      }
    })
    
    warning = `Cannot generate previews for variations: ${failedPreviewsIds.join(' | ')}`
    console.log('[slice/save]: Slice was saved!')
    

    return { previewUrls, warning }
  }