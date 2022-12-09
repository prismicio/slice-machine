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
import Files from "@slicemachine/core/build/node-utils/files";
import { SliceMockConfig } from "../../../../lib/models/common/MockConfig";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";

import onSaveSlice from "../common/hooks/onSaveSlice";
import { SliceSaveBody } from "../../../../lib/models/common/Slice";
import * as IO from "../../../../lib/io";
import { ComponentMocks, Slices } from "@slicemachine/core/build/models";
import { SliceComparator } from "@prismicio/types-internal/lib/customtypes/diff";
import { getOrElseW } from "fp-ts/lib/Either";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

export async function handler(
  env: BackendEnvironment,
  { sliceName, from, model: smModel, mockConfig }: SliceSaveBody
): Promise<Record<string, never>> {
  const previousSliceModel = Files.safeReadEntity(
    CustomPaths(env.cwd).library(from).slice(sliceName).model(),
    (payload) => getOrElseW(() => undefined)(SharedSlice.decode(payload))
  );
  const sliceModel = Slices.fromSM(smModel);

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
  Files.writeJson(modelPath, sliceModel);

  const sliceDiff = previousSliceModel
    ? SliceComparator.compare(previousSliceModel, sliceModel)
    : undefined;

  const customMocks = Files.safeReadEntity(
    sliceMockPath(env.cwd, from, sliceName),
    (payload) => getOrElseW(() => undefined)(ComponentMocks.decode(payload))
  );

  const mocks = mock(
    sliceModel,
    SliceMockConfig.getSliceMockConfig(updatedMockConfig, from, sliceName),
    customMocks,
    sliceDiff
  );
  Files.writeJson(sliceMockPath(env.cwd, from, sliceName), mocks);

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
