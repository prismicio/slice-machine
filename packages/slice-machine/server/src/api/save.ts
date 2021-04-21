import puppeteer from 'puppeteer'
import { fetchStorybookUrl, generatePreview } from './common/utils'
import { createScreenshotUrl } from '../../../lib/utils'
import { getPathToScreenshot } from '../../../lib/queries/screenshot'
import { CustomPaths, GeneratedPaths } from '../../../lib/models/paths'
import Storybook from './storybook'

import { getEnv } from '../../../lib/env'
import mock from '../../../lib/mock'
import { insert as insertMockConfig } from '../../../lib/mock/fs'
import Files from '../../../lib/utils/files'
import { Preview } from '../../../lib/models/common/Component'

const testStorybookPreview = async ({ screenshotUrl }: { screenshotUrl: string }) => {
  try {
    await fetchStorybookUrl(screenshotUrl)
  } catch (e) {
    return {
      warning: 'Could not connect to Storybook. Model was saved.'
    }
  }
  return {}
}

const handleStorybookPreview = async ({ screenshotUrl, pathToFile }: { screenshotUrl: string, pathToFile: string }) => {
  const { warning } = await testStorybookPreview({ screenshotUrl })
  if (warning) {
    return warning
  }
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  return warning || maybeErr ? 'Model was saved but screenshot could not be generated.' : null
}

 export default async function handler(req: { body: any }) {
    const { env } = await getEnv()
    const { sliceName, from, model, mockConfig } = req.body

    const updatedMockConfig = insertMockConfig(env.cwd, {
      key: sliceName,
      value: mockConfig
    })

    console.log('[update]: updating slice model')

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
      console.log('[update]: generating mocks')
    
      const mockedSlice = await mock(sliceName, model, updatedMockConfig[sliceName])
      Files.write(
        GeneratedPaths(env.cwd)
          .library(from)
          .slice(sliceName)
          .mocks(),
        mockedSlice
      )
    }

    const hasCustomStories = Files.exists(
      CustomPaths(env.cwd)
      .library(from)
      .slice(sliceName)
      .stories()
    )

    if(!hasCustomStories) {
      console.log('[update]: generating stories')
      Storybook.generateStories(env.framework, env.cwd, from, sliceName)
    }
    
    console.log('[update]: generating screenshots previews')
    // since we iterate over variation and execute async code, we need a regular `for` loop to make sure that it's done sequentially and wait for the promise before running the next iteration
    // no, even foreach doesn't do the trick ;)

    let errors: any[] = []
    let previewUrls: { [variationId: string]: Preview } = {}

    for(let i = 0; i < model.variations.length; i += 1) {
      const variation = model.variations[i]
      const screenshotArgs = {
        cwd: env.cwd,
        from,
        sliceName,
        variationId: variation.id
      }
      const activeScreenshot = getPathToScreenshot(screenshotArgs)
      
      if(!activeScreenshot) {
        const screenshotUrl = createScreenshotUrl({ storybook: env.userConfig.storybook, libraryName: from, sliceName, variationId: variation.id })
        const pathToFile = GeneratedPaths(env.cwd)
          .library(screenshotArgs.from)
          .slice(screenshotArgs.sliceName)
          .variation(screenshotArgs.variationId)
          .preview()
        const error = await handleStorybookPreview({ screenshotUrl, pathToFile })
        if(error) {
          console.log(`[update][Slice: ${sliceName}][variation: ${variation.id}]: ${error}`)
          previewUrls[variation.id] = {
            isCustomPreview: false,
            hasPreview: false,
          }
        } else {
          previewUrls[variation.id] = {
            isCustomPreview: false,
            hasPreview: true,
            url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(pathToFile)}&uniq=${Math.random()}`
          }
        }
      } else {
        previewUrls[variation.id] = {
          isCustomPreview: activeScreenshot.isCustom,
          hasPreview: true,
          url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(activeScreenshot.path)}&uniq=${Math.random()}`
        }
      }
    }

    console.log('[update]: done!')
    

    return errors.length ? { err: errors, previewUrls } : { previewUrls }
  }