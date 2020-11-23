import fs from 'fs'
import path from 'path'
import atob from 'atob'
import puppeteer from 'puppeteer'
import base64Img from 'base64-img'
import { fetchStorybookUrl, generatePreview } from './common/utils'

import { getEnv } from '../../lib/env'

import mock from '../../lib/mock'

export default async function handler(req) {
  const { env } = await getEnv()
  const { sliceName, from, model: strModel, screenshotUrl } = req.query

  const model = JSON.parse(atob(strModel))

  try {
    await fetchStorybookUrl(screenshotUrl)
  } catch(e) {
    return { err: e, reason: 'Could not connect to Storybook. Make sure Storybook is running and its url is set in SliceMachine configuration.' }
  }

  const rootPath = path.join(env.cwd, from, sliceName)
  const mockPath = path.join(rootPath, 'mocks.json')
  const modelPath = path.join(rootPath, 'model.json')

  const mockedSlice = await mock(sliceName, model)

  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
  fs.writeFileSync(mockPath, JSON.stringify(mockedSlice), 'utf-8')

  const pathToFile = path.join(env.cwd, from, sliceName, 'preview.png')
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  if (maybeErr) {
    return {
      err: maybeErr,
      reason: 'Could not generate screenshot. Check that it renders correctly in Storybook!'
    }
  }

  const screenshot = base64Img.base64Sync(pathToFile)

  return {
    previewUrl: screenshot,
    isModified: true
  }
}