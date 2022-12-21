import axios from "axios";
import path from "path";
import puppeteer from "puppeteer";
import { ScreenDimensions } from "../../../../lib/models/common/Screenshots";
import Files from "../../../../lib/utils/files";

interface PuppeteerHandleProps {
  screenshotUrl: string;
  pathToFile: string;
  screenDimensions: ScreenDimensions;
}

let puppeteerBrowserPromise: Promise<puppeteer.Browser> | null = null;

export default {
  handleScreenshot: async ({
    screenshotUrl,
    pathToFile,
    screenDimensions,
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
      screenDimensions
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
  screenDimensions: ScreenDimensions
): Promise<void> => {
  // Create an incognito context to isolate screenshots.
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setViewport({
    width: screenDimensions.width,
    height: screenDimensions.height,
  });

  try {
    Files.mkdir(path.dirname(pathToFile), { recursive: true });

    await page.goto(screenshotUrl, {
      waitUntil: "load",
    });

    await page.waitForSelector("#__iframe-ready", { timeout: 10000 });
    const element = await page.$("#__iframe-renderer");

    if (element) {
      await element.screenshot({
        path: pathToFile,
        clip: {
          width: screenDimensions.width,
          height: screenDimensions.height,
          x: 0,
          y: 0,
        },
      });
    } else {
      console.error("Could not find Simulator iframe (#__iframe-renderer).");
    }

    await context.close();
    return;
  } catch (error) {
    console.error(error);
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
