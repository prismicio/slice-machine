import puppeteer from 'puppeteer'

import { getEnv } from '../../lib/env'
import { createScreenshotUrl } from '../../lib/utils'
import { getPathToScreenshot, createPathToScreenshot } from '../../lib/queries/screenshot'

import { generatePreview } from './common/utils'

import { defaultSliceId } from '../../src/consts'

export default async function handler({ from, sliceName }) {
  const { env } = await getEnv()
  const screenshotUrl = createScreenshotUrl({ storybook: env.storybook, sliceName, variation: defaultSliceId })

  const screenshotArgs = { cwd: env.cwd, from, sliceName }
  const { isCustom } = getPathToScreenshot(screenshotArgs)
  const pathToFile = createPathToScreenshot(screenshotArgs)

  const browser = await puppeteer.launch()
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  if (maybeErr) {
    console.log('Uncaught error was returned from generate preview')
    return { err: maybeErr, reason: 'Could not generate screenshot. Check that it renders correctly in Storybook!' }
  }

  console.log({
    isCustom,
    pathToFile
  })
  await browser.close()
  return { previewUrl: `/api/__preview?q=${encodeURIComponent(pathToFile)}&uniq=${Math.random()}` }
}