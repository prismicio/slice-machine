import path from 'path'
import puppeteer from 'puppeteer'
import Files from '@lib/utils/files'
import { delay } from './utils'

export const fetchStorybookUrl = async (storybookUrl: string) => {
  return fetch(storybookUrl)
}

export const generatePreview = async (
  { browser, screenshotUrl, pathToFile }: { browser: puppeteer.Browser, screenshotUrl: string, pathToFile: string }
) => {
  try {
    Files.mkdir(path.dirname(pathToFile), { recursive: true })
    const page = await browser.newPage()
    await page.goto(screenshotUrl)
    await delay(600)
    await page.setViewport({
      width: 1200,
      height: 800,
    })
    await page.waitForSelector('#root')
    const element = await page.$('#root');
    if (element) {
      await element.screenshot({ path: pathToFile })
    }
    return null
  } catch (err) {
    return err
  }
}

export const testStorybookPreview = async ({ screenshotUrl }: { screenshotUrl: string }) => {
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

export const handleStorybookPreview = async ({ screenshotUrl, pathToFile }: { screenshotUrl: string, pathToFile: string }) => {
  const { warning } = await testStorybookPreview({ screenshotUrl })
  if (warning) {
    return warning
  }
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  return maybeErr ? 'Model was saved but screenshot could not be generated.' : null
}