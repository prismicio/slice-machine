import type { Models } from "@slicemachine/models";
import Files from "@lib/utils/files";
import Environment from "@lib/models/common/Environment";
import { CustomPaths, GeneratedPaths } from "@lib/models/paths";
import { handleStorybookPreview } from "./common/storybook";
import { Libraries } from "@slicemachine/core";
import {
  createScreenshotUI,
  ScreenshotUI,
} from "@lib/models/common/ComponentUI";

type Screenshots = Record<Models.VariationAsObject["id"], Models.Screenshot>;

export default {
  async generateForSlice(
    env: Environment,
    libraryName: string,
    sliceName: string
  ): Promise<[{ error: Error; variationId: string }[], Screenshots]> {
    let result: Screenshots = {};
    let failures: { error: Error; variationId: string }[] = [];

    const model = Files.readJson(
      CustomPaths(env.cwd).library(libraryName).slice(sliceName).model()
    );
    for (let i = 0; i < model.variations.length; i += 1) {
      const variation = model.variations[i];
      const generateResult = await this.generateForVariation(
        env,
        libraryName,
        sliceName,
        variation.id
      );
      if (generateResult instanceof Error) {
        failures = failures.concat([
          { error: generateResult, variationId: variation.id },
        ]);
      } else {
        result = { ...result, [variation.id]: generateResult };
      }
    }

    return [failures, result];
  },

  async generateForVariation(
    env: Environment,
    libraryName: string,
    sliceName: string,
    variationId: string
  ): Promise<Error | ScreenshotUI> {
    console.log("refactor createScreenshotUrl");
    const screenshotUrl = "⚠ The URL of slice-canvas based on params";
    const pathToFile = GeneratedPaths(env.cwd)
      .library(libraryName)
      .slice(sliceName)
      .variation(variationId)
      .preview();

    const maybeError = await handleStorybookPreview({
      screenshotUrl,
      pathToFile,
    });
    if (maybeError instanceof Error) {
      return maybeError;
    }

    return createScreenshotUI(env.baseUrl, pathToFile);
  },

  mergeWithCustomScreenshots(
    screenshotPaths: Screenshots,
    env: Environment,
    from: string,
    sliceName: string
  ): Screenshots {
    const entries = Object.entries(screenshotPaths).map(
      ([variationId, screenshot]) => {
        const maybePreviewPath = Libraries.resolvePathsToScreenshot({
          paths: [env.cwd],
          from,
          sliceName,
          variationId: variationId,
        });
        if (maybePreviewPath) {
          return [
            variationId,
            {
              exists: true,
              path: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(
                maybePreviewPath.path
              )}&uniq=${Math.random()}`,
            },
          ];
        }
        return [variationId, screenshot];
      }
    );
    return Object.fromEntries(entries);
  },
};
