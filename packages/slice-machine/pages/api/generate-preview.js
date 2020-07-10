import path from 'path'
import puppeteer from 'puppeteer'
import getConfig from "next/config"

const { publicRuntimeConfig: config } = getConfig()

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export default async function handler(req, res) {
  const browser = await puppeteer.launch();
  try {
    const { url, from, sliceName } = req.query
    const page = await browser.newPage()
    await page.goto(url);
    await delay(1500)
    await page.screenshot({ path: path.join(config.cwd, from, sliceName, 'preview.png') });
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
    res.status(200).send({ done: true })
  }
}