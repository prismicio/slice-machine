import Environment from '../../../../lib/models/common/Environment'
import { CustomType, ObjectTabs } from '../../../../lib/models/common/CustomType'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths } from '../../../../lib/models/paths'
import { TabAsObject } from '@lib/models/common/CustomType/tab'

interface CustomTypePayload {
  label: string
  key: string
  repeatable: boolean
}

export default async function handler(env: Environment, payload: CustomTypePayload): Promise<CustomType<ObjectTabs>> {
  const { label, key, repeatable } = payload

  const pathToNewCustomType = CustomTypesPaths(env.cwd).customType(`${key}.json`).model()
  const newCt = {
    id: key,
    label,
    status: true,
    repeatable,
    previewUrl: '',
    tabs: {
      Main: {} as TabAsObject
    }
  }
  Files.write(pathToNewCustomType, newCt)
  return newCt
}
