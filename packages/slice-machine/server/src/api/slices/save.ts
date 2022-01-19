/** global variable define in server/src/index.js **/
declare let appRoot: string;
import { CustomPaths, GeneratedPaths } from "@lib/models/paths";
import Storybook from "../storybook";

import getEnv from "../services/getEnv";
import mock from "@lib/mock/Slice";
import { insert as insertMockConfig } from "@lib/mock/misc/fs";
import Files from "@lib/utils/files";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { generateScreenshot } from "../screenshots/generate";
import { BackendEnvironment } from "@lib/models/common/Environment";

import onSaveSlice from "../common/hooks/onSaveSlice";
import onBeforeSaveSlice from "../common/hooks/onBeforeSaveSlice";
import { SliceSaveBody, SliceSaveResponse } from "@lib/models/common/Slice";

export async function handler(
  env: BackendEnvironment,
  { sliceName, from, model, mockConfig }: SliceSaveBody
): Promise<SliceSaveResponse> {
  await onBeforeSaveSlice({ from, sliceName, model }, env);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: sliceName,
    prefix: from,
    value: mockConfig,
  });

  console.log("\n\n[slice/save]: Updating slice model");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  Files.write(modelPath, model);

  const hasCustomMocks = Files.exists(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    CustomPaths(env.cwd).library(from).slice(sliceName).mocks()
  );

  if (!hasCustomMocks) {
    console.log("[slice/save]: Generating mocks");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mocks = await mock(
      sliceName,
      model,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      SliceMockConfig.getSliceMockConfig(updatedMockConfig, from, sliceName)
    );
    Files.write(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      GeneratedPaths(env.cwd).library(from).slice(sliceName).mocks(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mocks
    );
  }

  console.log("[slice/save]: Generating stories");
  Storybook.generateStories(appRoot, env.framework, env.cwd, from, sliceName);

  console.log("[slice/save]: Slice was saved!");

  await onSaveSlice(env);
  console.log("[slice/save]: Libraries index files regenerated!");

  const { screenshots, warning } = await generateScreenshotsWithLogs(
    env,
    from,
    sliceName
  );

  return { screenshots, warning };
}

async function generateScreenshotsWithLogs(
  env: BackendEnvironment,
  from: string,
  sliceName: string
): Promise<SliceSaveResponse> {
  if (!env.manifest.localSlicePreviewURL) {
    const message = "localSlicePreviewURL not configured on sm.json file";
    console.log(`[slice/save]: Cannot not generate screenshots: ${message}`);

    return Promise.resolve({ screenshots: {}, warning: message });
  }

  console.log("[slice/save]: Generating screenshots previews");
  const { screenshots, failure } = await generateScreenshot(
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
      screenshots,
      warning: `Could not generate previews for variations: ${failure
        .map((f) => f.variationId)
        .join(" | ")}`,
    };
  }

  return { screenshots, warning: null };
}

export default async function apiHandler(req: { body: SliceSaveBody }) {
  const { env } = await getEnv();
  return handler(env, req.body);
}
