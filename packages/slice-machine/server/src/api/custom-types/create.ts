import fs from 'fs'
import path from 'path'
import slash from 'slash'

import Environment from '../../../../lib/models/common/Environment'
import { CustomType } from '../../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../../lib/models/common/CustomType/tab'

interface CustomTypePayload {
  title: string
  key: string
  repeatable: boolean
}

export default async function handler(env: Environment, payload: CustomTypePayload): Promise<CustomType<TabsAsObject>> {
  const pathToCustomTypes = slash(path.join(env.cwd, 'customtypes'))
  const folderExists = fs.existsSync(pathToCustomTypes)
  if (!folderExists) {
    fs.mkdirSync(pathToCustomTypes)
  }
  const { title, key, repeatable } = payload

  const pathToNewCustomType = slash(path.join(pathToCustomTypes, `${key}.json`))
  const newCt = {
    title,
    id: key,
    repeatable,
    tabs: {
      Main: {}
    }
  }
  fs.writeFileSync(pathToNewCustomType, JSON.stringify(newCt))
  return newCt
}
