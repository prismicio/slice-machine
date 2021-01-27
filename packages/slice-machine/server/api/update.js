import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import base64Img from 'base64-img'
import { fetchStorybookUrl, generatePreview } from './common/utils'
import { createScreenshotUrl } from '../../lib/utils'
import { getPathToScreenshot, createPathToScreenshot } from '../../lib/queries/screenshot'

import { getEnv } from '../../lib/env'
import mock from '../../lib/mock'
import { insert as insertMockConfig } from '../../lib/mock/fs'

export default async function handler(req) {
  const { env } = await getEnv()
  const { sliceName, from, model, mockConfig } = req.body

  const screenshotUrl = createScreenshotUrl({ storybook: env.storybook, sliceName, variation: model.variations[0].id })

  try {
    console.log('\n[update]: checking Storybook url')
    await fetchStorybookUrl(screenshotUrl)
  } catch(e) {
    return { err: e, reason: 'Could not connect to Storybook. Make sure Storybook is running and its url is set in SliceMachine configuration.' }
  }

  const updatedMockConfig = insertMockConfig(env.cwd, { key: sliceName, value: mockConfig })

  const rootPath = path.join(env.cwd, from, sliceName)
  const mockPath = path.join(rootPath, 'mocks.json')
  const modelPath = path.join(rootPath, 'model.json')

  console.log('[update]: generating mocks')
  
  const mockedSlice = await mock(sliceName, model, updatedMockConfig[sliceName])

  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
  fs.writeFileSync(mockPath, JSON.stringify(mockedSlice, null, 2), 'utf-8')

  const screenshotArgs = { cwd: env.cwd, from, sliceName }
  const { isCustom } = getPathToScreenshot(screenshotArgs)
  const pathToFile = createPathToScreenshot(screenshotArgs)
  console.log('[update]: generating screenshot preview')
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  if (maybeErr) {
    return {
      err: maybeErr,
      reason: 'Could not generate screenshot. Check that it renders correctly in Storybook!'
    }
  }

  const screenshot = pathToFile ? base64Img.base64Sync(pathToFile) : null

  console.log('[update]: done!')
  return {
    ...!isCustom ? {
      previewUrl: screenshot,
      hasPreview: screenshot !== null
    } : null,
    isModified: true
  }
}