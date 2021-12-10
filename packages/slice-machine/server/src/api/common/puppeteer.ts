import path from "path";
import puppeteer from "puppeteer";
import Files from "@lib/utils/files";

interface PuppeteerHandleProps {
  screenshotUrl: string;
  pathToFile: string;
}

let puppeteerBrowserPromise: Promise<puppeteer.Browser> | null = null;

export default {
  handleScreenshot: async ({
    screenshotUrl,
    pathToFile,
  }: PuppeteerHandleProps): Promise<void | Error> => {
    const { warning } = await testUrl(screenshotUrl);
    if (warning) {
      return Error(warning);
    }

    if (!puppeteerBrowserPromise)
      puppeteerBrowserPromise = puppeteer.launch({
        args: [`--window-size=1200,800`],
      });
    const puppeteerBrowser = await puppeteerBrowserPromise;

    return generateScreenshot(
      puppeteerBrowser,
      screenshotUrl,
      pathToFile
    ).catch(
      () =>
        new Error(
          `Unable to generate screenshot for this page: ${screenshotUrl}`
        )
    );
  },
};

const generateScreenshot = async (
  browser: puppeteer.Browser,
  screenshotUrl: string,
  pathToFile: string
): Promise<void | Error> => {
  try {
    Files.mkdir(path.dirname(pathToFile), { recursive: true });
    const page = await browser.newPage();
    await page.goto(screenshotUrl);

    page.waitForNavigation({
      waitUntil: "networkidle0",
    });

    await page.waitForSelector("#root", { timeout: 2000 });
    const element = await page.$("#root");

    if (element) {
      await element.screenshot({ path: pathToFile });
    }
    return;
  } catch (err) {
    return err as Error;
  }
};

export const testUrl = async (
  screenshotUrl: string
): Promise<{ warning?: string }> => {
  try {
    await fetch(screenshotUrl);
  } catch (e) {
    return {
      warning: "Could not connect to Slice Renderer. Model was saved.",
    };
  }
  return {};
};
