import { getEnv } from '../../../../lib/env'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths, GeneratedCustomTypesPaths } from '../../../../lib/models/paths'

import { insert as insertMockConfig } from '../../../../lib/mock/misc/fs'

import mock from '../../../../lib/mock/CustomType'
import { CustomTypeMockConfig } from '../../../../lib/models/common/MockConfig'

export default async function handler(req: { body: any }) {
  const { env } = await getEnv()
  const { model, mockConfig, id, label, status, repeatable } = req.body

  const modelPath = CustomTypesPaths(env.cwd).customType(id).model()
  const mockPath = GeneratedCustomTypesPaths(env.cwd).customType(id).mock()

  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: id,
    prefix: '_cts',
    value: mockConfig
  })

  Files.write(modelPath, {
    id,
    label,
    status,
    repeatable,
    json: model.tabs
  })
  const mocked = await mock(model, CustomTypeMockConfig.getCustomTypeMockConfig(updatedMockConfig, id))
  Files.write(mockPath, mocked)
  return {}
}