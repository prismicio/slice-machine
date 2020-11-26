import fs from 'fs'
import path from 'path'

export const fetchStorybookUrl = async (storybookUrl) => {
  return fetch(storybookUrl)
}

export const generatePreview = async ({ browser, screenshotUrl, pathToFile }) => {
  try {
    fs.mkdirSync(path.dirname(pathToFile), { recursive: true })
    const page = await browser.newPage()
    await page.goto(screenshotUrl)
    await delay(600)
    await page.setViewport({
      width: 1200,
      height: 800,
    })
    await page.waitForSelector('#root')
    const element = await page.$('#root');
    await element.screenshot({ path: pathToFile })
    return null
  } catch (err) {
    return err
  }
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}