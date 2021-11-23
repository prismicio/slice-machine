import type { Models } from "@slicemachine/core";
import { getPathToScreenshot } from "@slicemachine/core/build/src/libraries/index";
import Files from "@lib/utils/files";
import Environment from "@lib/models/common/Environment";
import { CustomPaths, GeneratedPaths } from "@lib/models/paths";
import { createScreenshotUrl } from "@lib/utils";
import { handleStorybookPreview } from "./common/storybook";

type Previews = Record<Models.VariationAsObject["id"], Models.Preview>;

export default {
  async generateForSlice(
    env: Environment,
    libraryName: string,
    sliceName: string
  ): Promise<[{ error: Error; variationId: string }[], Previews]> {
    let result: Previews = {};
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
  ): Promise<Error | Models.Preview> {
    const screenshotUrl = createScreenshotUrl({
      storybook: env.userConfig.storybook,
      libraryName,
      sliceName,
      variationId,
    });
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

    return {
      isCustomPreview: false,
      hasPreview: true,
      path: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(
        pathToFile
      )}&uniq=${Math.random()}`,
    };
  },

  mergeWithCustomScreenshots(
    previewUrls: Previews,
    env: Environment,
    from: string,
    sliceName: string
  ): Previews {
    const R = Object.entries(previewUrls).reduce<Previews>(
      (acc, [variationId, p]) => {
        const maybePreviewPath = getPathToScreenshot({
          cwd: env.cwd,
          from,
          sliceName,
          variationId,
        });
        if (maybePreviewPath?.isCustom) {
          return {
            ...acc,
            [variationId]: {
              isCustomPreview: true,
              hasPreview: true,
              path: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(
                maybePreviewPath.path
              )}&uniq=${Math.random()}`,
            },
          };
        }
        return { [variationId]: p };
      },
      {}
    );
    return R;
  },
};
