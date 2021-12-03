/** global variable define in server/src/index.js **/
declare let appRoot: string;
import { CustomPaths, GeneratedPaths } from "@lib/models/paths";
import Storybook from "../storybook";

import type Models from "@slicemachine/core/build/src/models";
import getEnv from "../services/getEnv";
import mock from "@lib/mock/Slice";
import { insert as insertMockConfig } from "@lib/mock/misc/fs";
import Files from "@lib/utils/files";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import Previews from "../previews";
import Environment from "@lib/models/common/Environment";

import onSaveSlice from "../common/hooks/onSaveSlice";
import onBeforeSaveSlice from "../common/hooks/onBeforeSaveSlice";

interface Body {
  sliceName: string;
  from: string;
  model: Models.SliceAsObject;
  mockConfig?: SliceMockConfig;
}

export async function handler(
  env: Environment,
  { sliceName, from, model, mockConfig }: Body
): Promise<{
  previewUrls: Record<string, Models.Screenshot>;
  warning: string | null;
}> {
  await onBeforeSaveSlice({ from, sliceName, model }, env);

  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: sliceName,
    prefix: from,
    value: mockConfig,
  });

  console.log("\n\n[slice/save]: Updating slice model");

  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  Files.write(modelPath, model);

  const hasCustomMocks = Files.exists(
    CustomPaths(env.cwd).library(from).slice(sliceName).mocks()
  );

  if (!hasCustomMocks) {
    console.log("[slice/save]: Generating mocks");

    const mocks = await mock(
      sliceName,
      model,
      SliceMockConfig.getSliceMockConfig(updatedMockConfig, from, sliceName)
    );
    Files.write(
      GeneratedPaths(env.cwd).library(from).slice(sliceName).mocks(),
      mocks
    );
  }

  console.log("[slice/save]: Generating stories");
  Storybook.generateStories(appRoot, env.framework, env.cwd, from, sliceName);

  let warning: string | null = null;
  const previewUrls: { [variationId: string]: Models.Screenshot } = {};

  console.log("[slice/save]: Generating screenshots previews");
  const [failed, generatedPreviews] = await Previews.generateForSlice(
    env,
    from,
    sliceName
  );

  const mergedPreviews = Previews.mergeWithCustomScreenshots(
    generatedPreviews,
    env,
    from,
    sliceName
  );

  Object.entries(mergedPreviews).forEach(([variationId, p]) => {
    if (!p.exists) {
      const previewError = failed.find(
        (f) => f.variationId === variationId
      )?.error;
      warning =
        previewError?.message ||
        `Preview generation for variation ${variationId} has failed.`;
      console.log(
        `[slice/save][Slice: ${sliceName}][variation: ${variationId}]: ${previewError?.message}`
      );
      previewUrls[variationId] = {
        exists: false,
      };
    }

    const preview = p as Models.Screenshot;
    previewUrls[variationId] = {
      exists: true,
      path: preview.path,
    };
  });

  if (failed.length) {
    warning = `Cannot generate previews for variations: ${failed
      .map((f) => f.variationId)
      .join(" | ")}`;
  }
  console.log("[slice/save]: Slice was saved!");

  await onSaveSlice(env);
  console.log("[slice/save]: Libraries index files regenerated!");

  return { previewUrls, warning };
}

export default async function apiHandler(req: { body: Body }) {
  const { env } = await getEnv();
  return handler(env, req.body);
}
