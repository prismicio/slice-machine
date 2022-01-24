import getEnv from "../services/getEnv";
import Files from "@lib/utils/files";
import { CustomTypesPaths, GeneratedCustomTypesPaths } from "@lib/models/paths";

import { insert as insertMockConfig } from "@lib/mock/misc/fs";

import mock from "@lib/mock/CustomType";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { CustomType, SaveCustomTypeBody } from "@lib/models/common/CustomType";

export default async function handler(req: { body: SaveCustomTypeBody }) {
  const { env } = await getEnv();
  const { model, mockConfig } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const modelPath = CustomTypesPaths(env.cwd).customType(model.id).model();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const mockPath = GeneratedCustomTypesPaths(env.cwd)
    .customType(model.id)
    .mock();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: model.id,
    prefix: "_cts",
    value: mockConfig,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Files.write(modelPath, CustomType.toJsonModel(model));
  const mocked = await mock(
    model,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument
    CustomTypeMockConfig.getCustomTypeMockConfig(updatedMockConfig, model.id)
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Files.write(mockPath, mocked);
  return {};
}
