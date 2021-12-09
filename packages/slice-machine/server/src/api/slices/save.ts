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
import {
  Screenshots,
  generateScreenshotAndRemoveCustom,
} from "../screenshots/generate";
import { BackendEnvironment } from "@lib/models/common/Environment";

import onSaveSlice from "../common/hooks/onSaveSlice";
import onBeforeSaveSlice from "../common/hooks/onBeforeSaveSlice";

interface Body {
  sliceName: string;
  from: string;
  model: Models.SliceAsObject;
  mockConfig?: SliceMockConfig;
}

interface Response {
  previewUrls: Screenshots;
  warning: string | null;
}

export async function handler(
  env: BackendEnvironment,
  { sliceName, from, model, mockConfig }: Body
): Promise<Response> {
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

  const { previewUrls, warning } = await generateScreenshotsWithLogs(
    env,
    from,
    sliceName
  );
  console.log("[slice/save]: Slice was saved!");

  await onSaveSlice(env);
  console.log("[slice/save]: Libraries index files regenerated!");

  return { previewUrls, warning };
}

async function generateScreenshotsWithLogs(
  env: BackendEnvironment,
  from: string,
  sliceName: string
): Promise<Response> {
  if (!env.manifest.localSliceCanvasURL) {
    const message = "localSliceCanvasURL not configured on sm.json file";
    console.log(`[slice/save]: Cannot not generate screenshots: ${message}`);

    return Promise.resolve({ previewUrls: {}, warning: message });
  }

  console.log("[slice/save]: Generating screenshots previews");
  const { screenshots, failure } = await generateScreenshotAndRemoveCustom(
    env,
    from,
    sliceName
  );

  if (failure.length) {
    failure.forEach((f) => {
      console.log(
        `[slice/save][Slice: ${sliceName}][variation: ${f.variationId}]: ${f.error.message}`
      );
    });

    return {
      previewUrls: screenshots,
      warning: `Could not generate previews for variations: ${failure
        .map((f) => f.variationId)
        .join(" | ")}`,
    };
  }

  return { previewUrls: screenshots, warning: null };
}

export default async function apiHandler(req: { body: Body }) {
  const { env } = await getEnv();
  return handler(env, req.body);
}
