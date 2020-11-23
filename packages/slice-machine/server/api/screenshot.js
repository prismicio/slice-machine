import path from 'path'
import { getEnv } from '../../lib/env'
import base64Img from 'base64-img'
import puppeteer from 'puppeteer'

import { generatePreview } from './common/utils'

export default async function handler({ from, sliceName, screenshotUrl }) {
  const { env } = await getEnv()
  const pathToFile = path.join(env.cwd, from, sliceName, 'preview.png')
  const browser = await puppeteer.launch()
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  if (maybeErr) {
    console.log('Uncaught error was returned from generate preview')
    return { err: maybeErr, reason: 'Could not generate screenshot. Check that it renders correctly in Storybook!' }
  }
  await browser.close()
  return { previewUrl: base64Img.base64Sync(pathToFile) }
}