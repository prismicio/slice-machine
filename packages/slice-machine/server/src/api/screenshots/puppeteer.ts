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
    if (warning) return Error(warning);

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
  // Create an incognito context to isolate screenshots.
  const context = await browser.createIncognitoBrowserContext();
  // Create a new page in the context.
  const page = await context.newPage();

  try {
    Files.mkdir(path.dirname(pathToFile), { recursive: true });

    /* We use the waitUntil option in order for the component to be rendered properly.
     ** The value networkidle2 is required because Nuxt has an open socket with Webpack.
     */
    await page.goto(screenshotUrl, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("#root", { timeout: 2000 });
    const element = await page.$("#root");
    if (element) await element.screenshot({ path: pathToFile });

    await context.close();
    return;
  } catch (err) {
    await context.close();
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
