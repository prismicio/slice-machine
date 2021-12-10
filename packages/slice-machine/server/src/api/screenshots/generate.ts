import type Models from "@slicemachine/core/build/src/models";
import Files from "@lib/utils/files";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { FileSystem } from "@slicemachine/core";
import Puppeteer from "./puppeteer";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/src/libraries/screenshot";
import {
  createScreenshotUI,
  ScreenshotUI,
} from "@lib/models/common/ComponentUI";

export type Screenshots = Record<Models.VariationAsObject["id"], ScreenshotUI>;
type FailedScreenshot = {
  error: Error;
  variationId: Models.VariationAsObject["id"];
};

interface ScreenshotResults {
  screenshots: Screenshots;
  failure: FailedScreenshot[];
}

export async function generateScreenshot(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string
): Promise<ScreenshotResults> {
  const { screenshots, failure } = await generateForSlice(
    env,
    libraryName,
    sliceName
  );

  return {
    screenshots: screenshots,
    failure: failure,
  };
}

export async function generateScreenshotAndRemoveCustom(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string
): Promise<ScreenshotResults> {
  const { screenshots, failure } = await generateScreenshot(
    env,
    libraryName,
    sliceName
  );

  // Remove custom screenshot of success
  Object.keys(screenshots).forEach((variationId) =>
    removeCustomScreenshot(env, libraryName, sliceName, variationId)
  );

  return {
    screenshots: screenshots,
    failure: failure,
  };
}

async function generateForSlice(
  env: BackendEnvironment,
  libraryName: string,
  sliceName: string
): Promise<ScreenshotResults> {
  const slice: Models.SliceAsObject = Files.readJson(
    FileSystem.CustomPaths(env.cwd)
      .library(libraryName)
      .slice(sliceName)
      .model()
  );

  const variationIds: Models.VariationAsObject["id"][] = slice.variations.map(
    (v: Models.VariationAsObject) => v.id
  );

  const promises: Promise<ScreenshotUI | Error>[] = variationIds.map(
    (id: Models.VariationAsObject["id"]) =>
      generateForVariation(env, libraryName, slice, id)
  );
  const results: (ScreenshotUI | Error)[] = await Promise.all(promises);

  return results.reduce(
    (
      acc: ScreenshotResults,
      screenshotOrError: ScreenshotUI | Error,
      index: number
    ) => {
      if (screenshotOrError instanceof Error) {
        return {
          screenshots: acc.screenshots,
          failure: [
            ...acc.failure,
            { error: screenshotOrError, variationId: variationIds[index] },
          ],
        };
      }

      return {
        screenshots: {
          ...acc.screenshots,
          [variationIds[index]]: screenshotOrError,
        },
        failure: acc.failure,
      };
    },
    { screenshots: {}, failure: [] }
  );
}

async function generateForVariation(
  env: BackendEnvironment,
  libraryName: string,
  slice: Models.SliceAsObject,
  variationId: string
): Promise<ScreenshotUI | Error> {
  const screenshotUrl = `${
    env.manifest.localSliceCanvasURL
  }?lid=${encodeURIComponent(libraryName)}&sid=${encodeURIComponent(
    slice.id
  )}&vid=${encodeURIComponent(variationId)}`;

  const pathToFile = FileSystem.GeneratedPaths(env.cwd)
    .library(libraryName)
    .slice(slice.name)
    .variation(variationId)
    .preview();

  const maybeError = await Puppeteer.handleScreenshot({
    screenshotUrl,
    pathToFile,
  });
  if (maybeError instanceof Error) {
    return maybeError;
  }

  return createScreenshotUI(env.baseUrl, pathToFile);
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
