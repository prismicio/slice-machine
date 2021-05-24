import Environment from '../../../../lib/models/common/Environment'
import { CustomType } from '../../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../../lib/models/common/CustomType/tab'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths } from '../../../../lib/models/paths'

interface CustomTypePayload {
  label: string
  key: string
  repeatable: boolean
}

export default async function handler(env: Environment, payload: CustomTypePayload): Promise<CustomType<TabsAsObject>> {
  const { label, key, repeatable } = payload

  const pathToNewCustomType = CustomTypesPaths(env.cwd).customType(`${key}.json`).model()
  const newCt = {
    id: key,
    label,
    status: true,
    repeatable,
    previewUrl: '',
    tabs: {
      Main: {}
    }
  }
  Files.write(pathToNewCustomType, newCt)
  return newCt
}
