import getEnv from "../services/getEnv";
import Files from "../../../../lib/utils/files";
import {
  CustomTypesPaths,
  GeneratedCustomTypesPaths,
} from "../../../../lib/models/paths";

import { insert as insertMockConfig } from "../../../../lib/mock/misc/fs";

import mock from "../../../../lib/mock/CustomType";
import { CustomTypeMockConfig } from "../../../../lib/models/common/MockConfig";
import { SaveCustomTypeBody } from "../../../../lib/models/common/CustomType";
import * as IO from "../../../../lib/io";

export default async function handler(req: { body: SaveCustomTypeBody }) {
  const { env } = await getEnv();
  const { model, mockConfig } = req.body;

  const mockPath = GeneratedCustomTypesPaths(env.cwd)
    .customType(model.id)
    .mock();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: model.id,
    prefix: "_cts",
    value: mockConfig,
  });

  const modelPath = CustomTypesPaths(env.cwd).customType(model.id).model();
  IO.CustomType.writeCustomType(modelPath, model);

  const mocked = await mock(
    model,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument
    CustomTypeMockConfig.getCustomTypeMockConfig(updatedMockConfig, model.id)
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Files.write(mockPath, mocked as object);

  IO.Types.upsert(env.cwd);

  return {};
}
