import puppeteer from 'puppeteer'

import { getEnv } from '../../../lib/env'
import { Preview } from '../../../lib/models/common/Component'
import { createScreenshotUrl } from '../../../lib/utils'
import { getPathToScreenshot, createPathToScreenshot } from '../../../lib/queries/screenshot'

import { generatePreview } from './common/utils'

export default async function handler({ from, sliceName, variationName }: { from: string, sliceName: string, variationName: string }): Promise<Preview | { err: Error, reason: string }> {
  const { env } = await getEnv()
  const screenshotUrl = createScreenshotUrl({ storybook: env.userConfig.storybook, sliceName, variationName })

  const screenshotArgs = { cwd: env.cwd, from, sliceName, variationName }
  const { isCustom } = getPathToScreenshot(screenshotArgs)
  const pathToFile = createPathToScreenshot(screenshotArgs)
  const browser = await puppeteer.launch()
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  if (maybeErr) {
    console.log('Uncaught error was returned from generate preview')
    return { err: maybeErr, reason: 'Could not generate screenshot. Check that it renders correctly in Storybook!' }
  }

  await browser.close()
  return isCustom
  ? { hasPreview: false, isCustomPreview: false}
  : {
    isCustomPreview: false,
    hasPreview: true,
    url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(pathToFile)}&uniq=${Math.random()}`
  }
}