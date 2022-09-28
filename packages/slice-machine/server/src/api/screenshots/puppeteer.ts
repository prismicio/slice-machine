import axios from "axios";
import path from "path";
import puppeteer from "puppeteer";
import Files from "../../../../lib/utils/files";

interface PuppeteerHandleProps {
  screenshotUrl: string;
  pathToFile: string;
  screenWidth: string;
}

let puppeteerBrowserPromise: Promise<puppeteer.Browser> | null = null;

export default {
  handleScreenshot: async ({
    screenshotUrl,
    pathToFile,
    screenWidth,
  }: PuppeteerHandleProps): Promise<void> => {
    const { warning } = await testUrl(screenshotUrl);
    if (warning) throw new Error(warning);

    if (!puppeteerBrowserPromise) {
      puppeteerBrowserPromise = puppeteer.launch({
        defaultViewport: null,
      });
    }
    const puppeteerBrowser = await puppeteerBrowserPromise;

    return generateScreenshot(
      puppeteerBrowser,
      screenshotUrl,
      pathToFile,
      screenWidth
    ).catch(() => {
      throw new Error(
        `Unable to generate screenshot for this page: ${screenshotUrl}`
      );
    });
  },
};

const generateScreenshot = async (
  browser: puppeteer.Browser,
  screenshotUrl: string,
  pathToFile: string,
  screenWidth: string
): Promise<void> => {
  // Create an incognito context to isolate screenshots.
  const context = await browser.createIncognitoBrowserContext();
  // Create a new page in the context.
  const page = await context.newPage();
  await page.setViewport({ width: Number(screenWidth), height: 600 });

  try {
    Files.mkdir(path.dirname(pathToFile), { recursive: true });

    /* We use the waitUntil option in order for the component to be rendered properly.
     ** The value networkidle2 is required because Nuxt has an open socket with Webpack.
     */
    await page.goto(screenshotUrl, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("#root", { timeout: 10000 });
    const element = await page.$("#root");
    if (element) await element.screenshot({ path: pathToFile });

    await context.close();
    return;
  } catch (error) {
    await context.close();
    throw error;
  }
};

export const testUrl = async (
  screenshotUrl: string
): Promise<{ warning?: string }> => {
  try {
    await axios.get(screenshotUrl);
  } catch (e) {
    return {
      warning: "Could not connect to Slice Renderer. Model was saved.",
    };
  }
  return {};
};
