import fs from 'fs'
import path from 'path'
import base64Img from 'base64-img'
import puppeteer from 'puppeteer'
import { fetchStorybookUrl, generatePreview } from './common/utils'
import { createScreenshotUrl } from '../../../lib/utils'
import { getPathToScreenshot, createPathToScreenshot } from '../../../lib/queries/screenshot'

import { getEnv } from '../../../lib/env'
import mock from '../../../lib/mock'
import { insert as insertMockConfig } from '../../../lib/mock/fs'

const testStorybookPreview = async ({ screenshotUrl }) => {
  try {
    console.log('[update]: checking Storybook url')
    await fetchStorybookUrl(screenshotUrl)
  } catch (e) {
    return {
      warning: 'Could not connect to Storybook. Model was saved.'
    }
  }
  return {}
}

const handleStorybookPreview = async ({ screenshotUrl, pathToFile }) => {
  const { warning } = testStorybookPreview({ screenshotUrl })
  if (warning) {
    return warning
  }
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  return warning || maybeErr ? 'Model was saved but screenshot could not be generated.' : null
}

 export default async function handler(req) {
    const { env } = await getEnv()
    const { sliceName, from, model, mockConfig } = req.body

    const updatedMockConfig = insertMockConfig(env.cwd, {
      key: sliceName,
      value: mockConfig
    })

    const rootPath = path.join(env.cwd, from, sliceName)
    const mockPath = path.join(rootPath, 'mocks.json')
    const modelPath = path.join(rootPath, 'model.json')

    console.log('[update]: generating mocks')

    const mockedSlice = await mock(sliceName, model, updatedMockConfig[sliceName])

    fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
    fs.writeFileSync(mockPath, JSON.stringify(mockedSlice, null, 2), 'utf-8')

    
    
    console.log('[update]: generating screenshots previews')
    // since we iterate over variation and execute async code, we need a regular `for` loop to make sure that it's done sequentially and wait for the promise before running the next iteration
    // no, even foreach doesn't do the trick ;)

    let errors = []
    let previewUrls = {}

    for(let i = 0; i < model.variations.length; i += 1) {
      const variation = model.variations[i]
      const screenshotArgs = {
        cwd: env.cwd,
        from,
        sliceName,
        variationId: variation.id
      }
      const { exists, isCustom, path } = getPathToScreenshot(screenshotArgs)
      
      if(!exists) {
        const screenshotUrl = createScreenshotUrl({ storybook: env.userConfig.storybook, sliceName, variationId: variation.id })
        const pathToFile = createPathToScreenshot(screenshotArgs)
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
          isCustomPreview: isCustom,
          hasPreview: true,
          url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(path)}&uniq=${Math.random()}`
        }
      }
    }

    console.log('[update]: done!')
    

    return errors.length ? { err: errors, previewUrls } : { previewUrls }
  }