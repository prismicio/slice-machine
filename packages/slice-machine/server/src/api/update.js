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
  console.log('[update]: generating screenshot preview')
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  return warning || maybeErr ? 'Model was saved but screenshot could not be generated.' : null
}

 export default async function handler(req) {
    const { env } = await getEnv()
    const { sliceName, from, model, mockConfig } = req.body

    const screenshotUrl = createScreenshotUrl({ storybook: env.storybook, sliceName, variation: model.variations[0].id })
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

    const screenshotArgs = {
      cwd: env.cwd,
      from,
      sliceName,
      variationName: model.variations[0].id
    }
    const pathToFile = createPathToScreenshot(screenshotArgs)
    console.log('[update]: generating screenshot preview')

    const maybeWarning = await handleStorybookPreview({ screenshotUrl, pathToFile })

    if (maybeWarning) {
      console.log(`[update]: ${maybeWarning}`)
    }

    const { exists, isCustom } = getPathToScreenshot(screenshotArgs)

    const screenshot = exists && pathToFile ? base64Img.base64Sync(pathToFile) : null

    console.log('[update]: done!')
    return {
      ...!isCustom ? {
        previewUrl: screenshot,
        hasPreview: screenshot !== null
      } : null,
      isModified: true,
      ...maybeWarning ? {
        warning: maybeWarning,
      } : null
    }

  }
