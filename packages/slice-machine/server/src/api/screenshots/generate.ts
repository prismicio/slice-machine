import Files from "../../../../lib/utils/files";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import * as NodeUtils from "@prismic-beta/slicemachine-core/build/node-utils";
import Puppeteer from "./puppeteer";
import { resolvePathsToScreenshot } from "@prismic-beta/slicemachine-core/build/libraries/screenshot";
import {
  createScreenshotUI,
  ScreenshotUI,
} from "../../../../lib/models/common/ComponentUI";
import { ScreenDimensions } from "../../../../lib/models/common/Screenshots";

import { hash } from "@prismic-beta/slicemachine-core/build/utils/str";

export interface ScreenshotResults {
  screenshot: ScreenshotUI | null;
}

export async function generateScreenshotAndRemoveCustom(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string,
  screenDimensions: ScreenDimensions,
  href: string
): Promise<ScreenshotResults> {
  try {
    const result = await generateForVariation(
      env,
      libraryName,
      sliceName,
      variationId,
      screenDimensions,
      href
    );

    removeCustomScreenshot(env, libraryName, sliceName, variationId);

    return {
      screenshot: result,
    };
  } catch {
    return {
      screenshot: null,
    };
  }
}

async function generateForVariation(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string,
  screenDimensions: ScreenDimensions,
  href: string
): Promise<ScreenshotUI> {
  const screenshotUrl = `${env.baseUrl}/${href}/${sliceName}/${variationId}/screenshot`;

  const pathToFile = NodeUtils.GeneratedPaths(env.cwd)
    .library(libraryName)
    .slice(sliceName)
    .variation(variationId)
    .preview();

  await Puppeteer.handleScreenshot({
    screenshotUrl,
    pathToFile,
    screenDimensions,
  });
  return createScreenshotUI(env.baseUrl, {
    path: pathToFile,
    hash: hash(Files.readString(pathToFile)),
  });
}

export function removeCustomScreenshot(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string
): void {
  const maybeCustomScreenshot = resolvePathsToScreenshot({
    paths: [env.cwd],
    from: libraryName,
    sliceName,
    variationId,
  });
  if (maybeCustomScreenshot) Files.remove(maybeCustomScreenshot.path);
}
