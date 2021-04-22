import fs from 'fs'
import path from 'path'
import glob from 'glob'
import slash from 'slash'

import Environment from '../../../../lib/models/common/Environment'
import { CustomType } from '../../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../../lib/models/common/CustomType/tab'

const handlePath = (acc: Array<CustomType<TabsAsObject>>, p: string) => {
  const key = path.basename(path.dirname(p))
  console.log({ key })
  const file = fs.readFileSync(p, 'utf-8')
  try {
    const json = JSON.parse(file)
    return [
      ...acc,
      {
        id: key,
        ...json
      } as CustomType<TabsAsObject>
    ]
  } catch (e) {
    return acc
  }
}

export default async function handler(env: Environment): Promise<{ customTypes: ReadonlyArray<CustomType<TabsAsObject>> }> {
  const { cwd } = env
  const pathToCustomTypes = slash(path.join(cwd, 'customtypes'))
  const folderExists = fs.existsSync(pathToCustomTypes)
  if (!folderExists) {
    return { customTypes: [] }
  }
  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`)
  return { customTypes: matches.reduce(handlePath, []) }
}