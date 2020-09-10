import fs from 'fs'
import path from 'path'
import atob from 'atob'
import puppeteer from 'puppeteer'
import base64Img from 'base64-img'

import getConfig from 'next/config'

import mock from 'lib/mock'

const { publicRuntimeConfig: config } = getConfig()

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function generatePreview({ screenshotUrl, pathToFile }) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage()
    await page.goto(screenshotUrl);
    await delay(600)
    await page.screenshot({ path: pathToFile });
  } catch (e) {
    return e
  } finally {
    await browser.close();
    return null
  }
}

const fetchStorybookUrl = async (storybookUrl) => {
  return fetch(storybookUrl)
}

export default async function handler(req, res) {
  const { sliceName, from, model: strModel, screenshotUrl } = req.query

  console.log({
    screenshotUrl
  })
  const model = JSON.parse(atob(strModel))

  // const fetchreq = await fetchStorybookUrl(screenshotUrl)
  // console.log(fetchreq.status)
  try {
    await fetchStorybookUrl(screenshotUrl)
  } catch(e) {
    console.error(e)
    return res.status(400).send({ reason: 'Could not connect to Storybook. Make sure Storybook is running and its url is set in SliceMachine configuration.' })
  }

  const rootPath = path.join(config.cwd, from, sliceName)
  const mockPath = path.join(rootPath, 'mocks.json')
  const modelPath = path.join(rootPath, 'model.json')

  const mockedSlice = mock(sliceName, model)

  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')
  fs.writeFileSync(mockPath, JSON.stringify(mockedSlice), 'utf-8')

  const pathToFile = path.join(config.cwd, from, sliceName, 'preview.png')
  const err = await generatePreview({ screenshotUrl, sliceName, from, pathToFile })
  if (err) {
    console.log('err was returned from preview')
  }

  return res.status(200).send({
    previewUrl: base64Img.base64Sync(pathToFile),
    isModified: true
  })
}