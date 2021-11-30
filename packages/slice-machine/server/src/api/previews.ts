import Files from "@lib/utils/files";
import Environment from "@lib/models/common/Environment";
import { Preview } from "@lib/models/common/Component";
import { CustomPaths, GeneratedPaths } from "@lib/models/paths";
import { createScreenshotUrl } from "@lib/utils";
import { handleStorybookPreview } from "./common/storybook";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/src/libraries/screenshot"
type Previews = ReadonlyArray<
  { variationId: string; hasPreview: boolean; error: Error } | Preview
>;

export default {
  async generateForSlice(
    env: Environment,
    libraryName: string,
    sliceName: string
  ): Promise<
    ReadonlyArray<
      { variationId: string; error: Error; hasPreview: boolean } | Preview
    >
  > {
    let result: Previews = [];

    const model = Files.readJson(
      CustomPaths(env.cwd).library(libraryName).slice(sliceName).model()
    );
    for (let i = 0; i < model.variations.length; i += 1) {
      const variation = model.variations[i];
      result = result.concat([
        await this.generateForVariation(
          env,
          libraryName,
          sliceName,
          variation.id
        ),
      ]);
    }

    return result;
  },

  async generateForVariation(
    env: Environment,
    libraryName: string,
    sliceName: string,
    variationId: string
  ): Promise<
    { variationId: string; hasPreview: boolean; error: Error } | Preview
  > {
    console.log("Todo createScreenshotUrl");
    const screenshotUrl = createScreenshotUrl();
    const pathToFile = GeneratedPaths(env.cwd)
      .library(libraryName)
      .slice(sliceName)
      .variation(variationId)
      .preview();

    const maybeError = await handleStorybookPreview({
      screenshotUrl,
      pathToFile,
    });
    if (maybeError)
      return {
        variationId,
        error: new Error(maybeError as string),
        hasPreview: false,
      };

    return {
      variationId,
      isCustomPreview: false,
      hasPreview: true,
      url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(
        pathToFile
      )}&uniq=${Math.random()}`,
    };
  },

  mergeWithCustomScreenshots(
    previewUrls: Previews,
    env: Environment,
    from: string,
    sliceName: string
  ) {
    return previewUrls.map((p) => {
      const maybePreviewPath = resolvePathsToScreenshot({
        paths: [env.cwd],
        from,
        sliceName,
        variationId: p.variationId
      })
      if (maybePreviewPath) {
        return {
          variationId: p.variationId,
          isCustomPreview: true,
          hasPreview: true,
          url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(
            maybePreviewPath.path
          )}&uniq=${Math.random()}`,
        };
      }
      return p;
    });
  },
};
