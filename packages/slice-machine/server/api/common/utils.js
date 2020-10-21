export const fetchStorybookUrl = async (storybookUrl) => {
  return fetch(storybookUrl)
}

export const generatePreview = async ({ browser, screenshotUrl, pathToFile }) => {
  try {
    const page = await browser.newPage()
    await page.goto(screenshotUrl)
    await delay(600)
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