/** global variable define in server/src/index.js **/
declare let appRoot: string;
import { sliceMockPath } from "@slicemachine/core/build/node-utils/paths";
import { CustomPaths } from "../../../../lib/models/paths";
import Storybook from "../../../../lib/storybook";

import mock from "../../../../lib/mock/Slice";
import {
  getConfig,
  insert as insertMockConfig,
} from "../../../../lib/mock/misc/fs";
import { Files } from "@slicemachine/core/build/node-utils";
import { SliceMockConfig } from "../../../../lib/models/common/MockConfig";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";

import onSaveSlice from "../common/hooks/onSaveSlice";
import onBeforeSaveSlice from "../common/hooks/onBeforeSaveSlice";
import { SliceSaveBody } from "../../../../lib/models/common/Slice";
import * as IO from "../../../../lib/io";

export async function handler(
  env: BackendEnvironment,
  { sliceName, from, model: smModel, mockConfig }: SliceSaveBody
): Promise<Record<string, never>> {
  onBeforeSaveSlice({ from, sliceName }, env);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updatedMockConfig = mockConfig
    ? insertMockConfig(env.cwd, {
        key: sliceName,
        prefix: from,
        value: mockConfig,
      })
    : getConfig(env.cwd);

  console.log("\n\n[slice/save]: Updating slice model");

  const modelPath = CustomPaths(env.cwd).library(from).slice(sliceName).model();

  IO.Slice.writeSlice(modelPath, smModel);

  const hasCustomMocks = Files.exists(sliceMockPath(env.cwd, from, sliceName));

  if (!hasCustomMocks) {
    console.log("[slice/save]: Generating mocks");

    const mocks = mock(
      smModel,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      SliceMockConfig.getSliceMockConfig(updatedMockConfig, from, sliceName)
    );
    Files.writeJson(sliceMockPath(env.cwd, from, sliceName), mocks);
  }

  console.log("[slice/save]: Generating stories");
  Storybook.generateStories(
    appRoot,
    env.framework,
    env.cwd,
    from,
    sliceName,
    smModel
  );

  IO.Types.upsert(env);

  console.log("[slice/save]: Slice was saved!");

  await onSaveSlice(env);
  console.log("[slice/save]: Libraries index files regenerated!");

  return {};
}

export default async function apiHandler(req: {
  body: SliceSaveBody;
  env: BackendEnvironment;
}) {
  return handler(req.env, req.body);
}
