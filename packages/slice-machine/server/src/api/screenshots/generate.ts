import Files from "../../../../lib/utils/files";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import Puppeteer from "./puppeteer";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/libraries/screenshot";
import {
  createScreenshotUI,
  ScreenshotUI,
} from "../../../../lib/models/common/ComponentUI";
import { ScreenDimensions } from "../../../../lib/models/common/Screenshots";
import { SliceSM } from "@slicemachine/core/build/models";
import { hash } from "@slicemachine/core/build/utils/str";

import * as IO from "../../../../lib/io";

export interface ScreenshotResults {
  screenshot: ScreenshotUI | null;
}

export async function generateScreenshotAndRemoveCustom(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string,
  variationId: string,
  screenDimensions: ScreenDimensions
): Promise<ScreenshotResults> {
  const slice = IO.Slice.readSlice(
    NodeUtils.CustomPaths(env.cwd).library(libraryName).slice(sliceName).model()
  );

  try {
    const result = await generateForVariation(
      env,
      libraryName,
      slice,
      variationId,
      screenDimensions
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
  slice: SliceSM,
  variationId: string,
  screenDimensions: ScreenDimensions
): Promise<ScreenshotUI> {
  const screenshotUrl = `${
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    env.manifest.localSliceSimulatorURL
  }?lid=${encodeURIComponent(libraryName)}&sid=${encodeURIComponent(
    slice.id
  )}&vid=${encodeURIComponent(variationId)}`;

  const pathToFile = NodeUtils.GeneratedPaths(env.cwd)
    .library(libraryName)
    .slice(slice.name)
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
