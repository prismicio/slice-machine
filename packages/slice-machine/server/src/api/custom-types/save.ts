import { getEnv } from '../../../../lib/env'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths, GeneratedCustomTypesPaths } from '../../../../lib/models/paths'

import { insert as insertMockConfig } from '../../../../lib/mock/misc/fs'

import mock from '../../../../lib/mock/CustomType'
import { CustomTypeMockConfig } from '../../../../lib/models/common/MockConfig'
import { CustomType, ObjectTabs } from '../../../../lib/models/common/CustomType'

interface Body {
  model: CustomType<ObjectTabs>;
  mockConfig: CustomTypeMockConfig;
}
export default async function handler(req: { body: Body }) {
  const { env } = await getEnv()
  const { model, mockConfig } = req.body

  const modelPath = CustomTypesPaths(env.cwd).customType(model.id).model()
  const mockPath = GeneratedCustomTypesPaths(env.cwd).customType(model.id).mock()

  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: model.id,
    prefix: '_cts',
    value: mockConfig
  })

  Files.write(modelPath, CustomType.toJsonModel(model))
  const mocked = await mock(model, CustomTypeMockConfig.getCustomTypeMockConfig(updatedMockConfig, model.id))
  Files.write(mockPath, mocked)
  return {}
}