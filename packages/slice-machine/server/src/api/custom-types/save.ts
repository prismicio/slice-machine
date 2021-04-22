import { getEnv } from '../../../../lib/env'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths, GeneratedPaths } from '../../../../lib/models/paths'

import { insert as insertMockConfig } from '../../../../lib/mock/misc/fs'

import mock from '../../../../lib/mock/CustomType'

export default async function handler(req: { body: any }) {
  const { env } = await getEnv()
  const { model, mockConfig, id, label, status, repeatable } = req.body

  const modelPath = CustomTypesPaths(env.cwd).customType(id).model()
  const mockPath = GeneratedPaths(env.cwd).customType(id).mock()

  insertMockConfig(env.cwd, {
    key: id,
    value: mockConfig
  })

  Files.write(modelPath, {
    id,
    label,
    status,
    repeatable,
    tabs: model.tabs
  })
  const mocked = await mock(model)
  Files.write(mockPath, mocked)
  return {}
}